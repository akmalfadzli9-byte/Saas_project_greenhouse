// ========== CONFIGURATION (KEEP SECRET) ==========
const CONFIG = {
  SPREADSHEET_ID: '1ABC123...', // Your actual Google Sheet ID
  WHATSAPP_TOKEN: 'EAA...',
  OPENWEATHER_API_KEY: 'xyz...'
};

// ==================== CONFIGURATION ====================
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE', // Set your Google Sheet ID here
  API_KEY: 'sk_production_' + Utilities.getUuid(),
  APP_NAME: 'SmartFarm Manager',
  VERSION: '2.0.0'
};

// ========== WEB APP ENTRY POINT ==========
function doGet(e) {
  let page = e?.parameter?.page || 'dashboard';
  let htmlOutput = HtmlService.createHtmlOutputFromFile('index');
  
  // Optimize for mobile & fullscreen app
  htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes');
  htmlOutput.setTitle(CONFIG.APP_NAME);
  htmlOutput.setFaviconUrl('https://www.gstatic.com/images/branding/product/2/googleg_standard_color_128dp.png');
  htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  
  return htmlOutput;
}

// ========== AUTHENTICATION & SESSION ==========
function verifyAuth(token) {
  // Simple session validation (extend with your own logic)
  return token === Session.getTemporaryAuthorization();
}

function login(email, password) {
  // Replace with your own authentication logic (e.g., check against a sheet)
  if (email === 'demo@smartfarm.com' && password === 'demo123') {
    let token = Utilities.getUuid();
    let cache = CacheService.getScriptCache();
    cache.put(token, email, 21600); // 6 hours session
    return { success: true, token: token, user: { email: email, role: 'admin' } };
  }
  return { success: false, message: 'Invalid credentials' };
}

function logout(token) {
  let cache = CacheService.getScriptCache();
  cache.remove(token);
  return { success: true };
}

// ========== DATA ACCESS LAYER (CRUD wrappers) ==========
function getSheetData(sheetName, filters = {}) {
  try {
    let ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: `Sheet "${sheetName}" not found` };
    
    let data = sheet.getDataRange().getValues();
    let headers = data[0];
    let rows = data.slice(1);
    
    // Apply filters if any
    let filteredRows = rows;
    for (let key in filters) {
      let colIndex = headers.indexOf(key);
      if (colIndex !== -1) {
        filteredRows = filteredRows.filter(row => row[colIndex] == filters[key]);
      }
    }
    
    let objects = filteredRows.map(row => {
      let obj = {};
      headers.forEach((header, idx) => { obj[header] = row[idx]; });
      return obj;
    });
    
    return { success: true, data: objects, headers: headers };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function appendRow(sheetName, rowData) {
  try {
    let ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: `Sheet "${sheetName}" not found` };
    
    sheet.appendRow(rowData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function updateRow(sheetName, rowIndex, rowData) {
  try {
    let ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: `Sheet "${sheetName}" not found` };
    
    let range = sheet.getRange(rowIndex + 1, 1, 1, rowData.length);
    range.setValues([rowData]);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function deleteRow(sheetName, rowIndex) {
  try {
    let ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: `Sheet "${sheetName}" not found` };
    
    sheet.deleteRow(rowIndex + 1);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ========== MODULE-SPECIFIC OPERATIONS ==========
// Dashboard / Crop Management
function getCropLots() {
  return getSheetData('CropLots');
}

function addCropLot(cropData) {
  return appendRow('CropLots', cropData);
}

// Task Management
function getTasks() {
  return getSheetData('Tasks');
}

function addTask(taskData) {
  return appendRow('Tasks', taskData);
}

function completeTask(taskId, usageData) {
  // Mark task as completed and log inventory usage
  let result = updateRow('Tasks', taskId, ['Completed', new Date()]);
  if (result.success && usageData) {
    appendRow('InventoryUsage', [taskId, usageData.itemId, usageData.quantity, new Date()]);
  }
  return result;
}

// Inventory
function getInventory() {
  return getSheetData('Inventory');
}

function updateStock(itemId, newQuantity) {
  // Update inventory quantity
  let inventory = getSheetData('Inventory');
  let itemIndex = inventory.data.findIndex(item => item.id == itemId);
  if (itemIndex !== -1) {
    let rowData = [itemId, newQuantity, new Date()];
    return updateRow('Inventory', itemIndex + 1, rowData);
  }
  return { success: false, error: 'Item not found' };
}

// Harvest Tracking
function getHarvests() {
  return getSheetData('Harvests');
}

function addHarvest(harvestData) {
  return appendRow('Harvests', harvestData);
}

// Sales Tracking
function getSales() {
  return getSheetData('Sales');
}

function addSale(saleData) {
  return appendRow('Sales', saleData);
}

// Worker Attendance
function getAttendance() {
  return getSheetData('Attendance');
}

function checkIn(userId, greenhouseId) {
  return appendRow('Attendance', [userId, greenhouseId, new Date(), null]);
}

function checkOut(attendanceId) {
  return updateRow('Attendance', attendanceId, [null, new Date()]);
}

// Expenses
function getExpenses() {
  return getSheetData('Expenses');
}

function addExpense(expenseData) {
  return appendRow('Expenses', expenseData);
}

// Reports
function getProfitLoss(startDate, endDate) {
  let harvests = getSheetData('Harvests').data.filter(h => h.date >= startDate && h.date <= endDate);
  let expenses = getSheetData('Expenses').data.filter(e => e.date >= startDate && e.date <= endDate);
  
  let totalRevenue = harvests.reduce((sum, h) => sum + (h.quantity * h.price), 0);
  let totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  return {
    revenue: totalRevenue,
    expenses: totalExpenses,
    profit: totalRevenue - totalExpenses,
    margin: totalRevenue ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(2) : 0
  };
}

function exportReport(reportType, params) {
  // Generate CSV/PDF report
  let data;
  switch (reportType) {
    case 'harvest':
      data = getHarvests().data;
      break;
    case 'inventory':
      data = getInventory().data;
      break;
    case 'attendance':
      data = getAttendance().data;
      break;
    default:
      data = [];
  }
  
  let csv = convertToCSV(data);
  return {
    success: true,
    content: csv,
    filename: `${reportType}_report_${new Date().toISOString()}.csv`
  };
}

function convertToCSV(data) {
  if (!data.length) return '';
  let headers = Object.keys(data[0]);
  let csvRows = [headers.join(',')];
  for (let row of data) {
    let values = headers.map(header => JSON.stringify(row[header] || ''));
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
}

// ========== SHEETS INITIALIZATION ==========
function initializeSheets() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheets = ['CropLots', 'Tasks', 'Inventory', 'Harvests', 'Sales', 'Attendance', 'Expenses', 'InventoryUsage'];
  sheets.forEach(sheetName => {
    if (!ss.getSheetByName(sheetName)) {
      const sheet = ss.insertSheet(sheetName);
      // Add headers (customize as needed)
      switch(sheetName) {
        case 'CropLots': sheet.getRange(1,1,1,6).setValues([['id','type','variety','sowingDate','expectedHarvest','status']]); break;
        case 'Tasks': sheet.getRange(1,1,1,5).setValues([['id','title','assignedTo','dueDate','status']]); break;
        case 'Inventory': sheet.getRange(1,1,1,5).setValues([['id','item','category','stock','threshold']]); break;
        case 'Harvests': sheet.getRange(1,1,1,5).setValues([['id','cropLotId','date','quantity','price']]); break;
        default: sheet.appendRow(['id','data1','data2','data3','timestamp']);
      }
    }
  });
}



// ========== SENSOR DATA HANDLING ==========
function logSensorReading(greenhouseId, temperature, humidity, ph, ec) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName('SensorReadings');
  if (!sheet) {
    sheet = ss.insertSheet('SensorReadings');
    sheet.appendRow(['timestamp','greenhouseId','temperature','humidity','ph','ec']);
  }
  sheet.appendRow([new Date(), greenhouseId, temperature, humidity, ph, ec]);
  
  // Check thresholds and send alerts
  if (ph < 5.5 || ph > 7.0) sendAlert(`pH out of range: ${ph} in GH ${greenhouseId}`);
  return { success: true };
}

function sendAlert(message) {
  // Email or WhatsApp notification logic
  MailApp.sendEmail('admin@smartfarm.com', 'Critical Alert', message);
}

// ========== NOTIFICATION SERVICE ==========
function sendWhatsApp(phoneNumber, message) {
  // Integrate with WhatsApp Business API or Twilio (set up external API call)
  const payload = { to: phoneNumber, text: message };
  const options = {
    method: 'post',
    headers: { 'Authorization': 'Bearer ' + CONFIG.WHATSAPP_TOKEN, 'Content-Type': 'application/json' },
    payload: JSON.stringify(payload)
  };
  UrlFetchApp.fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', options);
}

a