
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Expense, DateRange, ExpenseCategory } from '@/data/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface ExportOptions {
  dateRange?: DateRange;
  categories?: ExpenseCategory[];
  groupId?: string;
  userName?: string;
}

export const usePdfExport = () => {
  const [expenses] = useLocalStorage<Expense[]>('expenses', []);
  const [userProfile] = useLocalStorage('userProfile', { name: 'User', email: '', phone: '' });
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  
  // Filter expenses based on options
  const filterExpenses = (options?: ExportOptions): Expense[] => {
    let filteredExpenses = [...expenses];
    
    // Filter by date range
    if (options?.dateRange) {
      const startDate = new Date(options.dateRange.startDate);
      const endDate = new Date(options.dateRange.endDate);
      
      filteredExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    }
    
    // Filter by categories
    if (options?.categories && options.categories.length > 0) {
      filteredExpenses = filteredExpenses.filter(expense => 
        options.categories!.includes(expense.category)
      );
    }
    
    // Filter by group
    if (options?.groupId) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.groupId === options.groupId
      );
    }
    
    return filteredExpenses;
  };
  
  const exportToPdf = async (title: string = 'Expense Report', options?: ExportOptions) => {
    try {
      setIsExporting(true);
      
      const filteredExpenses = filterExpenses(options);
      
      // If no expenses, show message and return
      if (filteredExpenses.length === 0) {
        toast({
          title: "No expenses to export",
          description: "There are no expenses matching the selected filters",
          variant: "destructive",
        });
        setIsExporting(false);
        return;
      }
      
      // Create PDF document with professional appearance
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Set document properties
      doc.setProperties({
        title: title,
        subject: 'Expense Report',
        author: userProfile.name || 'DineShareTrack User',
        creator: 'DineShareTrack'
      });
      
      // Professional header
      doc.setFillColor(245, 245, 245); // Light gray background
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Title
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(title, 15, 20);
      
      // Add logo/app name
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("DineShareTrack", pageWidth - 15, 15, { align: 'right' });
      
      // User information section
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15, 45, pageWidth - 30, 40, 3, 3, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, 45, pageWidth - 30, 40, 3, 3, 'S');
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("User Information", 20, 55);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      // User details
      const userName = userProfile.name || options?.userName || 'User';
      const userEmail = userProfile.email || 'Not provided';
      
      doc.text(`Name: ${userName}`, 20, 65);
      doc.text(`Email: ${userEmail}`, 20, 72);
      
      // Date range if provided
      if (options?.dateRange) {
        const startDate = format(new Date(options.dateRange.startDate), 'MMMM d, yyyy');
        const endDate = format(new Date(options.dateRange.endDate), 'MMMM d, yyyy');
        doc.text(`Report Period: ${startDate} — ${endDate}`, 20, 79);
      }
      
      // Generated date/time
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy, h:mm a')}`, pageWidth - 20, 79, { align: 'right' });
      
      // Daily summary table
      const expensesByDate = filteredExpenses.reduce((acc, expense) => {
        const dateKey = format(new Date(expense.date), 'yyyy-MM-dd');
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(expense);
        return acc;
      }, {} as Record<string, Expense[]>);
      
      // Calculate daily totals
      const dailyTotals = Object.entries(expensesByDate).map(([date, dayExpenses]) => {
        const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        return {
          date: format(new Date(date), 'MMM dd, yyyy'),
          count: dayExpenses.length,
          total
        };
      });
      
      // Sort by date (newest first)
      dailyTotals.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Add daily spending table
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Daily Expense Summary", 15, 100);
      
      // Create daily spending table
      const dailyTableData = dailyTotals.map(day => [
        day.date,
        day.count.toString(),
        `₹${day.total.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`
      ]);
      
      autoTable(doc, {
        startY: 105,
        head: [['Date', 'Number of Expenses', 'Total Amount']],
        body: dailyTableData,
        theme: 'striped',
        headStyles: {
          fillColor: [70, 70, 70],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'left' },
          1: { halign: 'center' },
          2: { halign: 'right' }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 15, right: 15 },
        styles: {
          fontSize: 10,
          cellPadding: 4,
          lineColor: [200, 200, 200]
        }
      });
      
      // Add page break
      doc.addPage();
      
      // Group by category
      const categoryTotals: Record<string, number> = {};
      filteredExpenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
          categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
      });
      
      // Prepare data for main expense table
      const tableData = filteredExpenses.map(expense => {
        return [
          format(new Date(expense.date), 'MMM dd, yyyy'),
          expense.category.charAt(0).toUpperCase() + expense.category.slice(1),
          expense.description || 'No description',
          `₹${expense.amount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`
        ];
      });
      
      // Sort by date (newest first)
      tableData.sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateB.getTime() - dateA.getTime();
      });
      
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Detailed Expense Entries", 15, 20);
      
      // Create detailed expense table
      autoTable(doc, {
        startY: 25,
        head: [['Date', 'Category', 'Description', 'Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [70, 70, 70],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { halign: 'right', cellWidth: 'auto' }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          lineColor: [200, 200, 200]
        },
        margin: { left: 15, right: 15 }
      });
      
      // Add summary
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      
      // Add Category Summary
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text('Category Summary', 15, finalY);
      
      const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const summaryData = Object.entries(categoryTotals).map(([category, amount]) => {
        return [
          category.charAt(0).toUpperCase() + category.slice(1),
          `₹${amount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`
        ];
      });
      
      // Add total row
      summaryData.push([
        'Total', 
        `₹${totalAmount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`
      ]);
      
      autoTable(doc, {
        startY: finalY + 5,
        body: summaryData,
        theme: 'plain',
        styles: {
          fontSize: 10,
          lineColor: [200, 200, 200]
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 15, right: 15 }
      });

      // Add thank you message
      const summaryFinalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Thank you for using DineShareTrack to manage your expenses.",
        pageWidth / 2,
        summaryFinalY,
        { align: 'center' }
      );
      
      // Add footer to all pages
      const addFooter = () => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          
          // Add footer
          doc.setFillColor(245, 245, 245);
          doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
          
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.setFont("helvetica", "normal");
          doc.text(
            'Generated by DineShareTrack',
            15,
            pageHeight - 10
          );
          
          doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth - 15,
            pageHeight - 10,
            { align: 'right' }
          );
        }
      };
      
      addFooter();
      
      // Save the PDF
      const fileName = `expense-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Export successful",
        description: `Report saved as ${fileName}`,
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export failed",
        description: "An error occurred while generating the PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return {
    exportToPdf,
    isExporting
  };
};
