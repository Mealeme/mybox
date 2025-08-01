const testExpense = { id: 'test-id', amount: 500, category: 'lunch', description: 'Test expense', date: new Date().toISOString() }; localStorage.setItem('expenses', JSON.stringify([testExpense]));
