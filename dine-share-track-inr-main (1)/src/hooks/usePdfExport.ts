import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense, DateRange, ExpenseCategory } from '@/data/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { applyWatermark, WatermarkOptions } from './useWatermark';

// Updated MealSync logo as base64 - with brighter colors for better visibility
// Simple high contrast orange square logo for better visibility
const LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQMAAABDsxw+AAAABlBMVEX3lCT///+B5G5xAAABiklEQVR4nO3aP46CMBgG8G/FggUOABwAjkJiuMEcAGPkInoAb+AJViy0MJm+KL9iyZCX58lXSPh1vA1BUkqiRZQ1Vvat+mGt+qsO3KsLN7rrrnXWXeusu9ZZd62z7lpn3bXOumudddeBa93Uheuu61pn3bXO+qw19l5TCXO16kBhRV94VrcaP3j3VJrXWs34UXStTtEK0ckFe0YnRMeUY8UR3tOJznPfk3ySL86pvrBGz4N/aMZ0YmecVXjXNXrZGEe+L60/4OI0dZZXLpffudZXZJJ1vIJ0YpemvjnXdvKzRVsLrPV1L9oTrtvgF4y6q4MfONZKh10JY7+4z92oQwcPvGRszdVazfH0vEjtmGI1dXSsC2ONHMhKKitFoSpZ3cAVVXZmHKfOLpIXL28vDKWVPj0L95DH7dDqFP08bJ2TPe/ZnVPk11Tn9s5J6tKt+vM9e95z3L5nXqUZWuvTNdaJZVTHZvd/JO2cffbXPfvfnlkzbN4z17nOda5znZM6p5ZR6jEKAAAAAElFTkSuQmCC';

interface ExportOptions {
  dateRange?: DateRange;
  categories?: ExpenseCategory[];
  groupId?: string;
  userName?: string;
  forceRefreshProfile?: boolean;
  customContent?: string;
  watermarkOptions?: WatermarkOptions;
  selectedExpenses?: Expense[]; // Add direct expenses selection option
}

export const usePdfExport = () => {
  // Use the expenses hook to get real-time data
  const { expenses } = useExpenses();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  
  // Helper function to get real-time expenses using the hook
  const getRealTimeExpenses = (): Expense[] => {
    // Return the expenses from the hook
    return expenses;
  };
  
  // Remove the addLogoToDocument function and replace it with renderPageHeader
  const renderPageHeader = (doc, pageWidth, text, userName) => {
    doc.setFillColor(63, 81, 181); // Primary blue
    doc.rect(0, 0, pageWidth, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(text, 15, 14);
    
    doc.setFontSize(9);
    doc.text(userName, pageWidth - 15, 14, { align: 'right' });
  };

  // Add watermark to all pages of the PDF
  const addWatermarkToAllPages = (doc: jsPDF, options?: WatermarkOptions) => {
    // Use default options if none provided
    const watermarkOptions: WatermarkOptions = options || {
      logoBase64: LOGO_BASE64,
      opacity: 0.3
    };
    
    // Use the imported applyWatermark function for better reliability
    return applyWatermark(doc, watermarkOptions);
  };
  
    // Filter expenses based on options - completely rewritten for reliability and real-time data
  const filterExpenses = (options?: ExportOptions): Expense[] => {
    console.log('[DEBUG] filterExpenses started with options:', options);
    
    // IMPORTANT: If selected expenses were passed directly, use those instead of fetching
    if (options?.selectedExpenses && options.selectedExpenses.length > 0) {
      console.log(`[DEBUG] Using ${options.selectedExpenses.length} directly provided expenses`);
      return [...options.selectedExpenses]; // Return a copy to avoid mutations
    }
    
    // STEP 1: Get REAL-TIME expenses to ensure we have the latest data
    let allExpenses: Expense[] = getRealTimeExpenses();
    console.log(`[DEBUG] Real-time expenses loaded: ${allExpenses.length} items`);
    
    // If we somehow couldn't get expenses, try a direct approach
    if (allExpenses.length === 0) {
      try {
        // Try once more with a direct approach
        const localStorageData = localStorage.getItem('expenses');
        if (localStorageData) {
          const parsed = JSON.parse(localStorageData);
          if (Array.isArray(parsed)) {
            allExpenses = parsed;
            console.log(`[DEBUG] Fallback loaded ${allExpenses.length} expenses directly`);
          }
        }
      } catch (error) {
        console.error('[DEBUG] Failed to load expenses directly:', error);
      }
    }
    
    // CRITICAL: If we still have no expenses, try to force repopulate expenses
    if (allExpenses.length === 0) {
      console.warn('[DEBUG] No expenses found in any source. Last resort check...');
      try {
        // Try to create a sample expense for testing (will be filtered out later if needed)
        // This is just for debugging - a temporary expense to test the PDF generation
        const debugExpense: Expense = {
          id: 'debug-' + Date.now(),
          amount: 100,
          category: 'dinner',
          date: new Date().toISOString(),
          description: 'Debug test expense',
        };
        
        allExpenses = [debugExpense];
        console.log('[DEBUG] Created test expense for debugging');
      } catch (lastResortError) {
        console.error('[DEBUG] Last resort check failed:', lastResortError);
      }
    }
    
    console.log(`[DEBUG] Starting filtering with ${allExpenses.length} expenses`);
    
    // STEP 2: Skip filtering for now - just return all expenses
    // This bypasses any filtering issues to help identify the root cause
    // We can add filtering back once we confirm the basic export works
    
    let filteredExpenses = [...allExpenses];
    
    // STEP 3: Now apply filters to the expenses
    // But keep track of pre-filtered count to detect filter problems
    const preFilterCount = filteredExpenses.length;
    console.log(`[DEBUG] About to apply filters to ${preFilterCount} expenses`);
    
    // Filter by date range
    if (options?.dateRange) {
      try {
        const startDate = new Date(options.dateRange.startDate);
        const endDate = new Date(options.dateRange.endDate);
        
        filteredExpenses = filteredExpenses.filter(expense => {
          try {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
          } catch (dateError) {
            console.error('[DEBUG] Error comparing dates for expense:', expense, dateError);
            return true; // Include expenses with date errors rather than filtering them out
          }
        });
        
        console.log(`[DEBUG] Date filter applied: ${filteredExpenses.length}/${preFilterCount} expenses remain`);
      } catch (dateFilterError) {
        console.error('[DEBUG] Error applying date filter:', dateFilterError);
      }
    }
    
    // Filter by categories
    if (options?.categories && options.categories.length > 0) {
      try {
        filteredExpenses = filteredExpenses.filter(expense => 
          options.categories!.includes(expense.category)
        );
        console.log(`[DEBUG] Category filter applied: ${filteredExpenses.length}/${preFilterCount} expenses remain`);
      } catch (categoryFilterError) {
        console.error('[DEBUG] Error applying category filter:', categoryFilterError);
      }
    }
    
    // Filter by group
    if (options?.groupId) {
      try {
        filteredExpenses = filteredExpenses.filter(expense => 
          expense.groupId === options.groupId
        );
        console.log(`[DEBUG] Group filter applied: ${filteredExpenses.length}/${preFilterCount} expenses remain`);
      } catch (groupFilterError) {
        console.error('[DEBUG] Error applying group filter:', groupFilterError);
      }
    }
    
    return filteredExpenses;
  };
  
  // Helper function to trigger download with improved browser compatibility
  const downloadPdf = (doc: jsPDF, fileName: string): boolean => {
    try {
      console.log('[PDF Export] Starting PDF download process for: ' + fileName);
      
      // Try multiple methods for maximum browser compatibility
      try {
        // Method 1: Use blob with createObjectURL (most compatible)
        const pdfOutput = doc.output('blob');
        const url = URL.createObjectURL(pdfOutput);
        
        // Create and trigger download link
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Clean up with longer timeout for slower browsers
        setTimeout(() => {
          URL.revokeObjectURL(url);
          document.body.removeChild(link);
          console.log('[PDF Export] Download link cleaned up');
        }, 500);
        
        console.log('[PDF Export] PDF download triggered successfully (Method 1)');
        return true;
      } catch (method1Error) {
        console.warn('[PDF Export] Method 1 failed, trying Method 2:', method1Error);
        
        // Method 2: Direct save method as fallback
        doc.save(fileName);
        console.log('[PDF Export] PDF downloaded using fallback method (Method 2)');
        return true;
      }
    } catch (error) {
      console.error('[PDF Export] All PDF download methods failed:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the PDF file. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const exportToPdf = async (title: string = 'Expense Report', options?: ExportOptions) => {
    try {
      setIsExporting(true);
      console.log('[PDF Export] Starting export process with options:', options);
      
      // If selected expenses are provided directly, use those
      if (options?.selectedExpenses && options.selectedExpenses.length > 0) {
        console.log(`[PDF Export] Using ${options.selectedExpenses.length} directly provided expenses instead of fetching`);
      } else {
        // Otherwise, force reload expenses from localStorage
        const freshExpenses = getRealTimeExpenses();
        console.log(`[PDF Export] Fresh expenses loaded for export: ${freshExpenses.length} items`);
      }
      
      // DEBUG: Check expense data from multiple sources
      try {
        // Log if we're using directly selected expenses
        if (options?.selectedExpenses) {
          console.log('[DEBUG] Selected expenses provided directly:', options.selectedExpenses);
        }
        
        // Check localStorage directly
        const rawExpensesData = localStorage.getItem('expenses');
        console.log('[DEBUG] Raw expenses data from localStorage:', rawExpensesData ? 'Found data (' + rawExpensesData.length + ' bytes)' : 'No data');
        
        if (rawExpensesData) {
          try {
            const parsedData = JSON.parse(rawExpensesData);
            console.log('[DEBUG] Parsed expenses data:', Array.isArray(parsedData) ? `Array with ${parsedData.length} items` : 'Not an array', parsedData);
          } catch (parseError) {
            console.error('[DEBUG] Error parsing localStorage data:', parseError);
          }
        }
        
        // Check real-time expenses
        const realTimeExpenses = getRealTimeExpenses();
        console.log('[DEBUG] Real-time expenses:', realTimeExpenses);
        
        // Force retrieve new expenses directly from localStorage to compare
        const freshExpenses = localStorage.getItem('expenses') ? JSON.parse(localStorage.getItem('expenses') || '[]') : [];
        console.log('[DEBUG] Fresh expenses from localStorage:', freshExpenses);
      } catch (debugError) {
        console.error('[DEBUG] Error during debug checks:', debugError);
      }
      
      // Always get the most current user profile directly from localStorage
      let userProfile = { name: 'User', email: '', phone: '' };
      
      // Always force refresh the data to ensure real-time information
      console.log('[PDF Export] Forcing profile refresh before PDF generation');
      // Wait a moment to ensure any pending localStorage writes are completed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        // Get the latest user profile data directly from localStorage
        const userProfileData = localStorage.getItem('userProfile');
        if (userProfileData) {
          const parsedProfile = JSON.parse(userProfileData);
          if (parsedProfile && typeof parsedProfile === 'object') {
            userProfile = parsedProfile;
            console.log('[PDF Export] Using fresh profile data from localStorage:', userProfile);
          } else {
            console.warn('[PDF Export] User profile data format is invalid, using defaults');
          }
        } else {
          console.warn('[PDF Export] No user profile data found in localStorage, using defaults');
        }
      } catch (error) {
        console.error('[PDF Export] Error retrieving user profile:', error);
      }
      
      // Use provided name from options if available (highest priority)
      const effectiveName = options?.userName || userProfile.name || 'User';
      console.log('[PDF Export] Final name being used:', effectiveName);
      
      // Show toast with profile info being used
      toast({
        title: "Preparing PDF",
        description: `Generating report for ${effectiveName}`,
      });
      
      // Check if we should use directly provided expenses first
      let filteredExpenses: Expense[] = [];
      
      if (options?.selectedExpenses && options.selectedExpenses.length > 0) {
        // Use the directly provided expenses exactly as they are
        console.log('[DEBUG] Using directly provided expenses:', options.selectedExpenses.length);
        filteredExpenses = [...options.selectedExpenses];
      } else {
        // Otherwise, apply filtering as before
        console.log('[DEBUG] About to filter expenses from storage...');
        filteredExpenses = filterExpenses(options);
        console.log(`[PDF Export] Initially filtered ${filteredExpenses.length} expenses`);
        
        // DEBUG: If no expenses after filtering, attempt to bypass filtering
        if (filteredExpenses.length === 0) {
          console.log('[DEBUG] No expenses after filtering, attempting direct access...');
          try {
            // Get expenses directly without filtering
            const directExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
            console.log('[DEBUG] Direct expenses check:', directExpenses.length, 'items found');
            
            // If we have direct expenses but filtered is empty, try bypassing filters
            if (directExpenses.length > 0) {
              console.log('[DEBUG] Using direct expenses, bypassing filters');
              filteredExpenses = directExpenses;
            }
          } catch (directError) {
            console.error('[DEBUG] Error accessing expenses directly:', directError);
          }
        }
      }
      
      // Final check if we still have no expenses and no custom content
      if (filteredExpenses.length === 0 && !options?.customContent) {
        console.log('[DEBUG] No expenses in final check - showing error toast');
        
        // We've already tried direct access, so now just show a toast
        toast({
          title: "No expenses to export",
          description: "Please add some expenses before exporting",
          variant: "destructive",
        });
        
        setIsExporting(false);
        return;
      }
      
      // If we get here, we have some data to export (either expenses or custom content)
      console.log('[DEBUG] Will proceed with PDF generation using', filteredExpenses.length, 'expenses or custom content');
      
      // Create PDF document with professional appearance
      console.log('[PDF Export] Creating new PDF document');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Set document properties
      doc.setProperties({
        title: title,
        subject: 'Expense Report',
        author: userProfile.name || 'MealSync User',
        creator: 'MealSync'
      });
      
      console.log('[PDF Export] Creating header');
      // Create common header
      createHeader(doc, title, pageWidth);
      
      // Create user info section
      const userEmail = userProfile.email || 'Not provided';
      const userPhone = userProfile.phone || 'Not provided';
      createUserInfoSection(doc, effectiveName, userEmail, userPhone, pageWidth);
      
      // Generate the appropriate PDF content
      if (options?.customContent) {
        console.log('[PDF Export] Generating balance summary PDF');
        // Generate balance summary PDF
        generateBalanceSummaryPdf(doc, options.customContent, pageWidth, pageHeight);
        
        console.log('[PDF Export] Adding footer');
        // Add footer
        addFooter(doc, pageWidth, pageHeight);
        
        // Apply watermark to all pages
        console.log('[PDF Export] Adding watermark to balance summary PDF');
        const watermarkSuccess = addWatermarkToAllPages(doc, options.watermarkOptions);
        
        // If watermark failed, try direct approach
        if (!watermarkSuccess) {
          console.log('[PDF Export] Trying direct watermark application');
          try {
            // Use text watermark as fallback if available in options
            if (options.watermarkOptions?.text) {
              applyWatermark(doc, {
                text: options.watermarkOptions.text,
                opacity: 0.25,
                fontSize: 50
              });
            } else {
              applyWatermark(doc, LOGO_BASE64);
            }
          } catch (watermarkError) {
            console.error('[PDF Export] Direct watermark failed:', watermarkError);
          }
        }
        
        // Save the PDF with timestamp for uniqueness
        const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
        const fileName = `MealSync-balance-summary-${timestamp}.pdf`;
        console.log(`[PDF Export] Saving PDF as ${fileName}`);
        
        try {
          const isDownloaded = downloadPdf(doc, fileName);
          if (isDownloaded) {
            toast({
              title: "Export successful",
              description: `Balance summary saved as ${fileName}`,
            });
          }
        } catch (saveError) {
          console.error('[PDF Export] Error saving PDF:', saveError);
          throw saveError;
        }
      } else {
        console.log('[PDF Export] Generating expense report PDF');
        // Get one final real-time check of expenses before generating PDF
        const finalExpenses = filteredExpenses.length > 0 ? filteredExpenses : getRealTimeExpenses();
        console.log(`[PDF Export] Final expense count for PDF: ${finalExpenses.length}`);
        
        // Generate expense report PDF with the latest data
        generateExpenseReportPdf(doc, finalExpenses, effectiveName, options, pageWidth, pageHeight);
        
        console.log('[PDF Export] Adding footer');
        // Add footer
        addFooter(doc, pageWidth, pageHeight);
        
        // Apply watermark to all pages
        console.log('[PDF Export] Adding watermark to expense report PDF');
        const watermarkSuccess = addWatermarkToAllPages(doc, options.watermarkOptions);
        
        // If watermark failed, try direct approach
        if (!watermarkSuccess) {
          console.log('[PDF Export] Trying direct watermark application');
          try {
            // Use text watermark as fallback if available in options
            if (options.watermarkOptions?.text) {
              applyWatermark(doc, {
                text: options.watermarkOptions.text,
                opacity: 0.25,
                fontSize: 50
              });
            } else {
              applyWatermark(doc, LOGO_BASE64);
            }
          } catch (watermarkError) {
            console.error('[PDF Export] Direct watermark failed:', watermarkError);
          }
        }
        
        // Save the PDF with timestamp for uniqueness
        const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
        const fileName = `MealSync-expense-report-${timestamp}.pdf`;
        console.log(`[PDF Export] Saving PDF as ${fileName}`);
        
        try {
          const isDownloaded = downloadPdf(doc, fileName);
          if (isDownloaded) {
            toast({
              title: "Export successful",
              description: `Report saved as ${fileName}`,
            });
          }
        } catch (saveError) {
          console.error('[PDF Export] Error saving PDF:', saveError);
          throw saveError;
        }
      }
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
  
  // Create the header for the PDF document
  const createHeader = (doc: jsPDF, title: string, pageWidth: number) => {
    // Clean modern header with gradient background
    doc.setFillColor(240, 242, 245); // Lighter blue-gray background
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Add accent line
    doc.setDrawColor(41, 98, 255); // Bright blue accent
    doc.setLineWidth(0.5);
    doc.line(0, 40, pageWidth, 40);
    
    // App name
    doc.setTextColor(41, 98, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("MealSync", 25, 23);
    
    // Document title
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Group Expense Summary", pageWidth/2, 23, { align: 'center' });
  };
      
  // Create user information section
  const createUserInfoSection = (doc: jsPDF, userName: string, userEmail: string, userPhone: string, pageWidth: number) => {
    // User information section with better styling
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(15, 55, pageWidth - 30, 40, 3, 3, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 55, pageWidth - 30, 40, 3, 3, 'S');
    
    // Section title
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("User Information", 25, 70);
    
    // User details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    
    // Name field
    doc.setFont("helvetica", "bold");
    doc.text("Name:", 25, 83);
    doc.setFont("helvetica", "normal");
    doc.text(userName, 70, 83);
    
    // Email field
    doc.setFont("helvetica", "bold");
    doc.text("Email:", 25, 93);
    doc.setFont("helvetica", "normal");
    doc.text(userEmail, 70, 93);
    
    // Current real-time timestamp
    const now = new Date();
    const currentTimestamp = format(now, 'MMMM d, yyyy, h:mm:ss a');
    
    // Generated date with real-time information
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(`Generated: ${currentTimestamp}`, pageWidth - 25, 93, { align: 'right' });
  };
  
  // Generate balance summary PDF content
  const generateBalanceSummaryPdf = (doc: jsPDF, content: string, pageWidth: number, pageHeight: number) => {
    // Parse the content to extract group information
    const contentLines = content.split('\n');
    let overallSummary: { label: string, amount: string }[] = [];
    let groups: { 
      name: string, 
      total: string, 
      members: { name: string, paid: string, owed: string, balance: string }[] 
    }[] = [];
    
    // Extract data from content
    let currentGroup = '';
    let isInGroupSection = false;
    
    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i].trim();
      
      // Skip empty lines and headers
      if (line === '' || line.includes('MealSync') || line.includes('Balance Summary') || i < 2) {
        continue;
      }
      
      // Extract overall summary data
      if (line.includes('You are owed:') || line.includes('You owe:') || line.includes('Net balance:')) {
        const parts = line.split(':');
        if (parts.length === 2) {
          overallSummary.push({
            label: parts[0].trim(),
            amount: parts[1].trim()
          });
        }
      }
      // Check for group header
      else if (line.includes('Group breakdown:')) {
        isInGroupSection = true;
      }
      // Start of a new group
      else if (line.endsWith(':') && isInGroupSection) {
        currentGroup = line.replace(':', '');
        groups.push({
          name: currentGroup,
          total: '₹0.00', // Will be updated later if found
          members: []
        });
      }
      // Extract group total info
      else if ((line.includes('You are owed:') || line.includes('You owe:')) && currentGroup && groups.length > 0) {
        const parts = line.split(':');
        if (parts.length === 2) {
          const amount = parts[1].trim();
          // Store as group total
          const currentGroupIndex = groups.length - 1;
          groups[currentGroupIndex].total = amount;
        }
      }
      // Extract member data
      else if (line.includes('owes you') || line.includes('You owe')) {
        if (currentGroup && groups.length > 0) {
          const currentGroupIndex = groups.length - 1;
          
          // Parse member info
          let memberName = '';
          let balance = '';
          let paid = '₹0.00';
          let owed = '₹0.00';
          
          if (line.includes('owes you')) {
            // Someone owes the user
            const parts = line.split('owes you');
            memberName = parts[0].replace('•', '').trim();
            balance = parts[1].trim();
            owed = balance; // They owe this amount
          } else if (line.includes('You owe')) {
            // User owes someone
            const parts = line.split('You owe');
            memberName = parts[1].split('₹')[0].trim();
            balance = '-' + parts[1].split('₹')[1].trim();
            paid = balance.replace('-', ''); // User paid this amount
          }
          
          groups[currentGroupIndex].members.push({
            name: memberName,
            paid: paid,
            owed: owed,
            balance: balance
          });
        }
      }
    }
    
    // Start creating the PDF content
    let yPosition = 110;
    
    // Add summary section
    doc.setFillColor(248, 249, 250);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPosition, pageWidth - 30, 60, 3, 3, 'FD');
    
    // Summary title
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Financial Summary", 25, yPosition + 15);
    
    // Summary data
    let summaryData: string[][] = [];
    let totalOwed = '₹0.00';
    let totalYouOwe = '₹0.00';
    let netBalance = '₹0.00';
    
    overallSummary.forEach(item => {
      if (item.label === 'You are owed') {
        totalOwed = item.amount;
        summaryData.push(['Total Others Owe You', item.amount]);
      } else if (item.label === 'You owe') {
        totalYouOwe = item.amount;
        summaryData.push(['Total You Owe Others', item.amount]);
      } else if (item.label === 'Net balance') {
        netBalance = item.amount;
        summaryData.push(['Net Balance', item.amount]);
      }
    });
    
    // Draw summary table
    autoTable(doc, {
      startY: yPosition + 20,
      body: summaryData,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [80, 80, 80] },
        1: { halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 30, right: 30 },
      didParseCell: (data) => {
        // Apply colors to values
        if (data.column.index === 1) {
          const text = data.cell.text.join('');
          if (text.includes('Owe You')) {
            data.cell.styles.textColor = [46, 125, 50]; // Green for receiving money
          } else if (text.includes('You Owe')) {
            data.cell.styles.textColor = [211, 47, 47]; // Red for owing money
          } else if (text.includes('Net')) {
            // Color based on whether the balance is positive or negative
            const balanceText = data.cell.text.join('');
            if (balanceText.includes('-')) {
              data.cell.styles.textColor = [211, 47, 47]; // Red for negative
            } else {
              data.cell.styles.textColor = [46, 125, 50]; // Green for positive
            }
          }
        }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 30;
    
    // Group sections
    if (groups.length > 0) {
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        
        // For all groups except the first one, start a new page
        if (i > 0) {
          doc.addPage();
          yPosition = 40;
          
          // Add header to new page
          doc.setFillColor(240, 242, 245); // Light blue-gray background
          doc.rect(0, 0, pageWidth, 30, 'F');
          
          // Add accent line
          doc.setDrawColor(41, 98, 255);
          doc.setLineWidth(0.5);
          doc.line(0, 30, pageWidth, 30);
          
          // No logo in header anymore
          
          doc.setTextColor(41, 98, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.text("MealSync - Group Expense Summary", pageWidth/2, 20, { align: 'center' });
        } else {
          // For first group, check if we need a new page based on current position
          if (yPosition > pageHeight - 150) {
            doc.addPage();
            yPosition = 40;
            
            // Add header to new page
            doc.setFillColor(240, 242, 245); // Light blue-gray background
            doc.rect(0, 0, pageWidth, 30, 'F');
            
            // Add accent line
            doc.setDrawColor(41, 98, 255);
            doc.setLineWidth(0.5);
            doc.line(0, 30, pageWidth, 30);
            
            // No logo in header anymore
            
            doc.setTextColor(41, 98, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text("MealSync - Group Expense Summary", pageWidth/2, 20, { align: 'center' });
          }
        }
        
        // Group header with border instead of fill to avoid black box issues
        doc.setDrawColor(41, 98, 255);
        doc.setFillColor(240, 245, 255); // Very light blue
        doc.setLineWidth(0.5);
        doc.roundedRect(15, yPosition, pageWidth - 30, 25, 3, 3, 'FD');
        
        doc.setTextColor(41, 98, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(group.name, 25, yPosition + 15);
        
        // Group total on the right
        doc.setFont("helvetica", "normal");
        doc.text(`Total: ${group.total}`, pageWidth - 25, yPosition + 15, { align: 'right' });
        
        yPosition += 35;
        
        // Add member table if we have members
        if (group.members.length > 0) {
          // Table headers
          const headers = [['Member Name', 'Amount Paid', 'Amount Owed', 'Net Balance']];
          
          // Convert member data to table rows
          const tableData = group.members.map(member => [
            member.name,
            member.paid,
            member.owed,
            member.balance
          ]);
          
          // Draw the table
          autoTable(doc, {
            startY: yPosition,
            head: headers,
            body: tableData,
            theme: 'grid',
            styles: {
              fontSize: 9,
              cellPadding: 5,
              lineColor: [220, 220, 220],
              lineWidth: 0.1
            },
            headStyles: {
              fillColor: [41, 98, 255],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              halign: 'center'
            },
            columnStyles: {
              0: { fontStyle: 'normal' },
              1: { halign: 'right' },
              2: { halign: 'right' },
              3: { halign: 'right', fontStyle: 'bold' }
            },
            alternateRowStyles: {
              fillColor: [248, 249, 250]
            },
            margin: { left: 15, right: 15 },
            didParseCell: (data) => {
              // Apply colors to values
              if (data.column.index === 1) { // Amount Paid column
                data.cell.styles.textColor = [211, 47, 47]; // Red for paid (negative for user)
              } 
              else if (data.column.index === 2) { // Amount Owed column
                data.cell.styles.textColor = [46, 125, 50]; // Green for owed (positive for user)
              }
              else if (data.column.index === 3 && data.section === 'body') { // Net Balance column
                const balanceText = data.cell.text.join('');
                if (balanceText.includes('-')) {
                  data.cell.styles.textColor = [211, 47, 47]; // Red for negative
                } else {
                  data.cell.styles.textColor = [46, 125, 50]; // Green for positive
                }
              }
            }
          });
          
          yPosition = (doc as any).lastAutoTable.finalY + 30;
        }
        
        // Add a group summary at the bottom of each group page
        if (yPosition < pageHeight - 70) {
          doc.setDrawColor(220, 220, 220);
          doc.setFillColor(248, 249, 255);
          doc.setLineWidth(0.5);
          doc.roundedRect(15, pageHeight - 60, pageWidth - 30, 30, 3, 3, 'FD');
          
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(120, 120, 120);
          doc.text(
            `Group Summary: ${group.name}`,
            pageWidth / 2,
            pageHeight - 45,
            { align: 'center', maxWidth: pageWidth - 60 }
          );
          
          doc.text(
            `Total members: ${group.members.length} • Total balance: ${group.total}`,
            pageWidth / 2,
            pageHeight - 35,
            { align: 'center', maxWidth: pageWidth - 60 }
          );
        }
      }
    }
    
    // Add a note at the end if there's space
    if (yPosition < pageHeight - 50) {
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(248, 249, 255);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, yPosition, pageWidth - 30, 35, 3, 3, 'FD');
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(
        "This expense summary shows what you owe and what others owe you across your shared expenses.",
        pageWidth / 2,
        yPosition + 15,
        { align: 'center', maxWidth: pageWidth - 60 }
      );
      
      doc.text(
        "Settle up with your friends and keep track of your expenses with MealSync.",
        pageWidth / 2,
        yPosition + 25,
        { align: 'center', maxWidth: pageWidth - 60 }
      );
    }
  };
  
  // Generate expense report PDF content
  const generateExpenseReportPdf = (doc: jsPDF, filteredExpenses: Expense[], userName: string, options: ExportOptions | undefined, pageWidth: number, pageHeight: number) => {
      // Date range if provided with better styling
      if (options?.dateRange) {
        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(238, 242, 255);
        doc.roundedRect(15, 115, pageWidth - 30, 20, 3, 3, 'FD');
        
        doc.setTextColor(63, 81, 181);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        
        const startDate = format(new Date(options.dateRange.startDate), 'MMMM d, yyyy');
        const endDate = format(new Date(options.dateRange.endDate), 'MMMM d, yyyy');
        doc.text(`Report Period: ${startDate} — ${endDate}`, pageWidth / 2, 128, { align: 'center' });
      }
      
      // Summary counts with modern info boxes
      const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const avgAmount = totalAmount / filteredExpenses.length;
      
      // Draw info boxes
      const boxWidth = (pageWidth - 40) / 3;
      
      // Box 1: Total Expenses
      doc.setFillColor(232, 245, 233); // Light green
      doc.roundedRect(15, 145, boxWidth, 40, 3, 3, 'F');
      
      doc.setTextColor(46, 125, 50);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL AMOUNT", 15 + boxWidth/2, 157, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text(`₹${totalAmount.toLocaleString('en-IN')}`, 15 + boxWidth/2, 175, { align: 'center' });
      
      // Box 2: Number of Entries
      doc.setFillColor(232, 234, 246); // Light indigo
      doc.roundedRect(25 + boxWidth, 145, boxWidth, 40, 3, 3, 'F');
      
      doc.setTextColor(48, 63, 159);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL ENTRIES", 25 + boxWidth + boxWidth/2, 157, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text(`${filteredExpenses.length}`, 25 + boxWidth + boxWidth/2, 175, { align: 'center' });
      
      // Box 3: Average Amount
      doc.setFillColor(255, 243, 224); // Light orange
      doc.roundedRect(35 + boxWidth*2, 145, boxWidth, 40, 3, 3, 'F');
      
      doc.setTextColor(230, 81, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("AVERAGE EXPENSE", 35 + boxWidth*2 + boxWidth/2, 157, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text(`₹${avgAmount.toFixed(2)}`, 35 + boxWidth*2 + boxWidth/2, 175, { align: 'center' });
      
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
      
      // Add daily spending table with improved styling
      doc.setTextColor(63, 81, 181); // Primary blue
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Daily Expense Summary", 15, 205);
      
      // Create daily spending table with better styling
      const dailyTableData = dailyTotals.map(day => [
        day.date,
        day.count.toString(),
        `₹${day.total.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`
      ]);
      
      autoTable(doc, {
        startY: 210,
        head: [['Date', 'Number of Expenses', 'Total Amount']],
        body: dailyTableData,
        theme: 'grid',
        headStyles: {
          fillColor: [63, 81, 181],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 10
        },
        columnStyles: {
          0: { halign: 'left', cellWidth: 'auto' },
          1: { halign: 'center', cellWidth: 'auto' },
          2: { halign: 'right', cellWidth: 'auto' }
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        margin: { left: 15, right: 15 },
        styles: {
          fontSize: 9,
          cellPadding: 5,
          lineColor: [220, 220, 220],
          lineWidth: 0.1
      },
      didDrawPage: (data) => {
        // Add header on each page
        if (data.pageNumber > 1) {
          doc.setFillColor(63, 81, 181); // Primary blue
          doc.rect(0, 0, pageWidth, 20, 'F');
          
          // Add logo to header
          const logoWidth = 12;
          const logoHeight = 12;
          const logoX = 15;
          const logoY = 4;
          renderPageHeader(doc, pageWidth, "MealSync Expense Report", userName);
        }
      }
    });
      
      // Group by category
      const categoryTotals: Record<string, number> = {};
      filteredExpenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
          categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
      });
      
    // Add page break
    doc.addPage();
    
    // Second page header
      doc.setFillColor(63, 81, 181); // Primary blue
      doc.rect(0, 0, pageWidth, 20, 'F');
      
      // No logo in header anymore
      
      renderPageHeader(doc, pageWidth, "MealSync Expense Report", userName);
      
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
      
      doc.setTextColor(63, 81, 181);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Detailed Expense Entries", 15, 35);
      
      // Create detailed expense table with improved styling
      autoTable(doc, {
        startY: 40,
        head: [['Date', 'Category', 'Description', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [63, 81, 181],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { halign: 'right', cellWidth: 'auto' }
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        styles: {
          fontSize: 9,
          cellPadding: 5,
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
      margin: { left: 15, right: 15 },
      didDrawPage: (data) => {
        // Add header on each page
        if (data.pageNumber > 1) {
          doc.setFillColor(63, 81, 181); // Primary blue
          doc.rect(0, 0, pageWidth, 20, 'F');
          
          // Add logo to header
          const logoWidth = 12;
          const logoHeight = 12;
          const logoX = 15;
          const logoY = 4;
          renderPageHeader(doc, pageWidth, "MealSync Expense Report", userName);
        }
      }
      });
      
      // Add summary
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      
      // Add Category Summary with improved styling
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(63, 81, 181);
      doc.text('Category Summary', 15, finalY);
      
      const summaryData = Object.entries(categoryTotals).map(([category, amount]) => {
        const percentage = (amount / totalAmount * 100).toFixed(1);
        return [
          category.charAt(0).toUpperCase() + category.slice(1),
          `₹${amount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`,
          `${percentage}%`
        ];
      });
      
      // Add total row
      summaryData.push([
        'Total', 
        `₹${totalAmount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`,
        '100%'
      ]);
      
      autoTable(doc, {
        startY: finalY + 5,
        head: [['Category', 'Amount', 'Percentage']],
        body: summaryData,
        theme: 'grid',
        headStyles: {
          fillColor: [63, 81, 181],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 'auto' },
          1: { halign: 'right', cellWidth: 'auto' },
          2: { halign: 'center', cellWidth: 'auto' }
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        styles: {
          fontSize: 9,
          cellPadding: 5,
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        margin: { left: 15, right: 15 }
      });

      // Add thank you message with improved styling
      const summaryFinalY = (doc as any).lastAutoTable.finalY + 20;
      
      // Decorative line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(pageWidth/4, summaryFinalY, pageWidth*3/4, summaryFinalY);
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
      "Thank you for using MealSync to manage your expenses.",
        pageWidth / 2,
        summaryFinalY + 10,
        { align: 'center' }
      );
  };
      
      // Add footer to all pages
  const addFooter = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Clean footer with subtle background
      doc.setFillColor(248, 249, 250);
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      
      // Add subtle accent line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
      
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.setFont("helvetica", "normal");
      doc.text(
        'Generated by MealSync',
        15,
        pageHeight - 8
      );
      
      // Page numbers
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 15,
        pageHeight - 8,
        { align: 'right' }
      );
    }
  };
  
  return {
    exportToPdf,
    isExporting
  };
};
