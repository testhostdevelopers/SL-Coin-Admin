(function () {
    var container = document.querySelector('.table-upload-wrapper');
    var fileInput = container.querySelector('#file-upload');
    var fileIndicator = container.querySelector('.file-indicator');
    var file = null;
    var uploadBtn = container.querySelector('#uploadBtn');
    var table = container.querySelector('table.upload-data');

    var sendBtn = container.querySelector('#sendBtn');
    const CHUNK_SIZE = 50;



    fileInput.addEventListener('change', onFileChange);
    uploadBtn.addEventListener('click', onUploadClick);
    // sendBtn.addEventListener('click', onSendClick);


    function onUploadClick() {
        if (!file) {
            table.innerText = 'No data';
            return;
        }

        var fileReader = new FileReader();

        fileReader.addEventListener('load', function onLoad(event) {
            var contents = event.target.result;
            var data;
            try {
                data = processData(contents);
            } catch (error) {
                console.error(error);
                table.innerText = 'Error reading file';
            }

            data.shift();


            var splittedData = [];
            var i, j, temparray;
            for (i = 0, j = data.length; i < j; i += CHUNK_SIZE) {
                splittedData.push(data.slice(i, i + CHUNK_SIZE));
            }

            if (data) {
                buildTable(splittedData);
            }

        })
        fileReader.readAsText(file);
    }

    function buildTable(splittedData) {
        var tableBody = table.querySelector('tbody');
        tableBody.innerHTML = null;


        splittedData.forEach(function (chunk, chunkIndex) {
            chunk.forEach(function (rowData, index) {
                var totalIndex = chunkIndex * CHUNK_SIZE + index + 1;
                var tableRow = createRow(rowData, totalIndex);
                tableBody.appendChild(tableRow);
            })
            tableBody.appendChild(createButton(chunk));
        })



    }

    function createButton(chunk) {
        var row = document.createElement('tr');
        row.appendChild(document.createElement('td'));
        row.appendChild(document.createElement('td'));
        var td = document.createElement('td');
        td.style.textAlign = 'right';
        td.style.paddingRight = '0px';
        row.appendChild(td);

        var button = document.createElement('button');
        button.classList.add('btn', 'btn-success');
        button.innerHTML = 'Create batch transfer request';
        button.addEventListener('click', function () {
            dropTokens(chunk);
        })

        td.appendChild(button);
        return row;
    }


    //airdrop here
    function dropTokens(chunk) {
        var addresses = [];
        var values = [];

        chunk.forEach(function (data) {
            addresses.push(data[0]);
            values.push(data[1]*Math.pow(10,18));
        });

        console.log(addresses)

        window.createAirdropRequest(addresses, values);

    }

    function createRow(data, index) {
        var tableRow = document.createElement('tr');
        var indexCell = document.createElement('td');
        indexCell.innerHTML = index;
        tableRow.appendChild(indexCell);
        data.forEach(function (item) {
            var bodyCell = document.createElement('td');
            bodyCell.innerText = item;
            tableRow.appendChild(bodyCell);
        })
        return tableRow;
    }

    function processData(allText) {
        var allTextLines = allText.split(/\r\n|\n/);
        var lines = allTextLines.map(function (item) {
            return item.split(',');
        });
        return lines;
    }

    function onSendClick() {
        console.log(file);
    }

    function onFileChange(event) {
        file = event.target.files[0];
        if (file) {
            uploadBtn.classList.remove('disabled');
            fileIndicator.innerText = file.name;
        }
    }
    


})()