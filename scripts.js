// scripts.js

let currentSortColumn = null;
let isAscending = true;
let jsonData = [];
let columnOrder = [];

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

function getAllColumns() {
    return columnOrder;
}

function generateTable(data) {
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');

    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    const headers = getAllColumns();
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.setAttribute('data-column', header);
        th.onclick = () => sortTable(header);
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
                    a.target = '_blank'; // Open link in new tab
                    td.appendChild(a);
                } else {
                    td.textContent = item[header];
                }
            }
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });

    updateHeaderClasses();
}

function extractNumber(value) {
    if (typeof value === 'string') {
        // Extract numbers from the string using regex
        const match = value.match(/[-+]?[0-9]*\.?[0-9]+/);
        return match ? parseFloat(match[0]) : NaN;
    }
    return isNaN(value) ? NaN : Number(value);
}

function sortTable(column) {
    let sortedData = [...jsonData];

    if (currentSortColumn === column) {
        isAscending = !isAscending;
    } else {
        currentSortColumn = column;
        isAscending = true;
    }

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

    generateTable(sortedData);
}


function updateHeaderClasses() {
    const tableHeader = document.getElementById('tableHeader');
    tableHeader.querySelectorAll('th').forEach(th => {
        th.classList.remove('ascending', 'descending');
        if (th.getAttribute('data-column') === currentSortColumn) {
            th.classList.add(isAscending ? 'ascending' : 'descending');
        }
    });
}

function initializeTable() {
    fetch('./data.json')
        .then(response => response.json())
        .then(data => {
            jsonData = data['entries'];
            populateFooter(data['capture_date']);
            columnOrder = createColumnOrder(jsonData);
            generateTable(jsonData);
            const initsortcol = getAllColumns()[3];
            sortTable(initsortcol);
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

initializeTable();