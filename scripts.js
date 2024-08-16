// scripts.js

let currentSortColumn1 = null;
let currentSortColumn2 = null;
let isAscending1 = true;
let isAscending2 = true;
let jsonData1 = [];
let jsonData2 = [];
let columnOrder1 = [];
let columnOrder2 = [];

function createColumnOrder(data) {
    const order = [];
    data.forEach(item => {
        Object.keys(item).forEach(key => {
            if (!key.endsWith('_HREF') && !order.includes(key)) {
                order.push(key);
            }
        });
    });
    return order;
}

function getAllColumns(columnOrder) {
    return columnOrder;
}

function generateTable(data, tableId, columnOrder) {
    const tableHeader = document.getElementById(`tableHeader${tableId}`);
    const tableBody = document.getElementById(`tableBody${tableId}`);

    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    const headers = getAllColumns(columnOrder);
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.setAttribute('data-column', header);
        th.onclick = () => sortTable(header, tableId);
        tableHeader.appendChild(th);
    });

    data.forEach(item => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            if (item[header] !== undefined) {
                if (item[header + '_HREF']) {
                    const a = document.createElement('a');
                    a.href = item[header + '_HREF'];
                    a.textContent = item[header];
                    a.target = '_blank';
                    td.appendChild(a);
                } else {
                    td.textContent = item[header];
                }
            }
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });

    updateHeaderClasses(tableId);
}

function extractNumber(value) {
    if (typeof value === 'string') {
        // Extract numbers from the string using regex
        const match = value.match(/[-+]?[0-9]*\.?[0-9]+/);
        return match ? parseFloat(match[0]) : NaN;
    }
    return isNaN(value) ? NaN : Number(value);
}

function sortTable(column, tableId) {
    const jsonData = tableId === 1 ? jsonData1 : jsonData2;
    let sortedData = [...jsonData];

    if (tableId === 1) {
        if (currentSortColumn1 === column) {
            isAscending1 = !isAscending1;
        } else {
            currentSortColumn1 = column;
            isAscending1 = true;
        }
    } else {
        if (currentSortColumn2 === column) {
            isAscending2 = !isAscending2;
        } else {
            currentSortColumn2 = column;
            isAscending2 = true;
        }
    }

    const isAscending = tableId === 1 ? isAscending1 : isAscending2;

    sortedData.sort((a, b) => {
        const aValue = extractNumber(a[column]);
        const bValue = extractNumber(b[column]);

        if (isNaN(aValue) || isNaN(bValue)) {
            // If either value is not a number, fallback to string comparison
            if (a[column] === undefined) return 1;
            if (b[column] === undefined) return -1;
            if (a[column] < b[column]) return isAscending ? -1 : 1;
            if (a[column] > b[column]) return isAscending ? 1 : -1;
            return 0;
        }

        if (aValue < bValue) return isAscending ? 1 : -1;
        if (aValue > bValue) return isAscending ? -1 : 1;
        return 0;
    });

    generateTable(sortedData, tableId, tableId === 1 ? columnOrder1 : columnOrder2);
}



function updateHeaderClasses(tableId) {
    const tableHeader = document.getElementById(`tableHeader${tableId}`);
    const currentSortColumn = tableId === 1 ? currentSortColumn1 : currentSortColumn2;
    const isAscending = tableId === 1 ? isAscending1 : isAscending2;

    tableHeader.querySelectorAll('th').forEach(th => {
        th.classList.remove('ascending', 'descending');
        if (th.getAttribute('data-column') === currentSortColumn) {
            th.classList.add(isAscending ? 'descending' : 'ascending');
        }
    });
}

function initializeTables() {
    Promise.all([
        fetch('./data.json').then(response => response.json()),
        fetch('./data2.json').then(response => response.json())
    ])
    .then(([data1, data2]) => {
        jsonData1 = data1['entries'];
        jsonData2 = data2['entries'];
        populateFooter(data1['capture_date']);
        columnOrder1 = createColumnOrder(jsonData1);
        columnOrder2 = createColumnOrder(jsonData2);
        generateTable(jsonData1, 1, columnOrder1);
        generateTable(jsonData2, 2, columnOrder2);
        sortTable(getAllColumns(columnOrder1)[2], 1); //sort by last 2 weeks played
        sortTable(getAllColumns(columnOrder2)[1], 2); //sort by overall stats
    })
    .catch(error => console.error('Error loading the JSON data:', error));
}

function populateFooter(captureDate) {
    const footerElement = document.getElementById('footer');
    if (footerElement) {
        const formattedDate = formatDate(captureDate);
        const relativeTime = getRelativeTime(captureDate);
        footerElement.textContent = `Data captured on: ${formattedDate} (${relativeTime})`;
    } else {
        console.error('Footer element not found');
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
}

function getRelativeTime(dateString) {
    const now = new Date();
    const pastDate = new Date(dateString);
    const diffInMs = now - pastDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

initializeTables();

// Open the default tab
document.getElementById("defaultOpen").click();
