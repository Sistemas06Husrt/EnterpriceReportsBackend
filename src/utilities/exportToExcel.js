
 function exportExcel(constData) {
        var aspose = aspose || {};

        aspose.cells = require("aspose.cells");
        const fs = require('fs');

        //Set the license
        new aspose.cells.License().setLicense("License.lic");

        // Read the JSON file data into a string variable named jsonData
        const jsonFile = constData;
        fs.readFile(jsonFile, 'utf8', (err, jsonData) => {
            if (err) {
                console.error('File could not be read:', err);
                return;
            }

            // Set formatting for JSON data in the output Excel file
            var cellsFactory = new aspose.cells.CellsFactory();
            var titleStyle = cellsFactory.createStyle();
            titleStyle.setHorizontalAlignment(aspose.cells.TextAlignmentType.LEFT);
            titleStyle.getFont().setColor(aspose.cells.Color.getGreen());
            titleStyle.getFont().setBold(true);

            // Create the jsonOptions class object to format data while calling importData() function
            var jsonOptions = new aspose.cells.JsonLayoutOptions();
            jsonOptions.setTitleStyle(titleStyle);
            jsonOptions.setArrayAsTable(true);

            // Instantiate a Workbook object
            var wb = new aspose.cells.Workbook();
            var sheet = wb.getWorksheets().get(0);

            // Use the importData() function by providing required parameters
            aspose.cells.JsonUtility.importData(jsonData, sheet.getCells(), 0, 0, jsonOptions);

            // Save the output
            wb.save("Output.xlsx");

            console.log("JSON to Excel conversion performed successfully");
        });

    }

exports.exportExcelData = exportExcel;