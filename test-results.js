const dbConfig = require("./config/db");

const MongoClient = require("mongodb").MongoClient;

var PdfPrinter = require('pdfmake');
const fetch = require('node-fetch');

const url = dbConfig.url;
const local = "http://localhost:3000/files/";
const web = "https://www.orbitalnodetechnologies.com/files/";
const baseUrl = web;
const nlocal = "http://localhost:3000/news/";
const nweb = "https://www.orbitalnodetechnologies.com/news/";
const nbaseUrl = nweb;
const mongoClient = new MongoClient(url);

var Roboto = require('./fonts/Roboto');




const connect = async () => {
    mongoClient.connect();
    var student_data;
    var class_name = "SSS2B"
    var session_name = "2022/2023"

    const database = mongoClient.db(dbConfig.database);
    const schools = database.collection("schools");

    let school_data = await schools.findOne({ 'school_info.name': "ST. PAULS COLLEGE AHULE" });

    var sessionIndex = school_data.sessions.findIndex(i => i.name === session_name);
    var currTermIndex = school_data.sessions[sessionIndex].terms.findIndex(i => i.name === school_data.sessions[sessionIndex].current_term);

    for (var i = 0; i < school_data.sessions[sessionIndex].terms[currTermIndex].students.length; i++) {
        student_data = school_data.sessions[sessionIndex].terms[currTermIndex].students[i];
        // Perform action . . .
        downloadPdf(school_data, student_data, class_name, sessionIndex, currTermIndex);
    }
}


const downloadPdf = async (school_data, student_data, class_name, sessionIndex, currTermIndex) => {
    try {
        var stdNumber = 0;

        // Count numbr of students in class . . .
        for (var i = 0; i < school_data.sessions[sessionIndex].terms[currTermIndex].students.length; i++) {
            if (school_data.sessions[sessionIndex].terms[currTermIndex].students[i].class === class_name) {
                stdNumber++;
            }
        }


        var url = school_data.school_info.logo;
        var stampUrl = school_data.school_info.stamp;
        var rest = await fetch(url, { encoding: null });
        var stampRest = await fetch(stampUrl, { encoding: null });
        imageBuffer = await rest.buffer();
        stampBuffer = await stampRest.buffer();
        var img = new Buffer.from(imageBuffer, 'base64');
        var stamp = new Buffer.from(stampBuffer, 'base64');

        let tableItems = [
            [{ rowSpan: 2, text: 'Subjects', alignment: 'center', style: 'tableHeader' }, { text: 'C. Assessments', style: 'tableHeader', colSpan: 4, alignment: 'center' }, {}, {}, {}, { text: 'Total', style: 'tableHeader', alignment: 'center' }, { text: 'Average', style: 'tableHeader', alignment: 'center' }, { text: 'Highest', style: 'tableHeader', alignment: 'center' }, { text: 'Lowest', style: 'tableHeader', alignment: 'center' }, { text: 'Rank', style: 'tableHeader', alignment: 'center' }, { text: 'Grade', style: 'tableHeader', alignment: 'center' }],
            ['', { text: '1ST\nC.A', style: 'tableHeader', alignment: 'center' }, { text: '2ND\nC.A', style: 'tableHeader', alignment: 'center' }, { text: '3RD\nC.A', style: 'tableHeader', alignment: 'center' }, { text: 'EXAMS', style: 'tableHeader', alignment: 'center' }, '', '', '', '', '', ''],
        ];

        for (var i = 0; i < student_data.subjects.length; i++) {
            tableItems.push([{ text: student_data.subjects[i].name, style: 'tableHeader' }, { text: student_data.subjects[i].ass[0], style: 'tableHeader', alignment: 'center' }, { text: student_data.subjects[i].ass[1], style: 'tableHeader', alignment: 'center' }, { text: student_data.subjects[i].ass[2], style: 'tableHeader', alignment: 'center' }, { text: student_data.subjects[i].ass[3], style: 'tableHeader', alignment: 'center' }, { text: student_data.subjects[i].total, style: 'tableHeader', alignment: 'center' }, { text: student_data.subjects[i].average.toFixed(2), style: 'tableHeader', alignment: 'center' }, { text: student_data.subjects[i].highest, style: 'tableHeader', alignment: 'center' }, { text: student_data.subjects[i].lowest, style: 'tableHeader', alignment: 'center' }, { text: position_qualifier(student_data.subjects[i].position), style: 'tableHeader', alignment: 'center' }, { text: gradeHelper(student_data.subjects[i].total), style: 'tableHeader', alignment: 'center' }])
        }

        var dt = new Date();
        var mm = ((dt.getMonth() + 1) >= 10) ? (dt.getMonth() + 1) : '0' + (dt.getMonth() + 1);
        var dd = ((dt.getDate()) >= 10) ? (dt.getDate()) : '0' + (dt.getDate());
        var yyyy = dt.getFullYear();
        var date = yyyy + "/" + mm + "/" + dd;

        var docDefinition = {
            content: [
                {
                    image: img,
                    fit: [60, 60],
                    style: {
                        alignment: 'center',
                    },
                },
                {
                    text: school_data.school_info.name,
                    style: 'header',
                    alignment: 'center'
                },
                {
                    text: `${school_data.school_info.state}, Nigeria`,
                    style: 'subheader',
                    alignment: 'center'
                },
                {
                    columns: [
                        {
                            width: '*',
                            style: 'top',
                            text: `Name of Student: ${student_data.name}`
                        },
                        {
                            width: 'auto',
                            style: 'top',
                            text: `Session: ${school_data.sessions[sessionIndex].name}`
                        },
                    ]
                },
                {
                    columns: [
                        {
                            width: '*',
                            style: 'top',
                            text: `School: ${school_data.school_info.name}`
                        },
                        {
                            width: 'auto',
                            style: 'top',
                            text: `Sex: ${student_data.gender.charAt(0).toUpperCase() + student_data.gender.slice(1)}`
                        },
                    ]
                },
                {
                    columns: [
                        {
                            width: '*',
                            style: 'top',
                            text: `Term: ${school_data.sessions[sessionIndex].terms[currTermIndex].name.charAt(0).toUpperCase() + school_data.sessions[sessionIndex].terms[currTermIndex].name.slice(1)}`
                        },
                        {
                            width: 'auto',
                            style: 'top',
                            text: `Date of Birth: ${student_data.dob}`
                        },
                    ]
                },
                {
                    columns: [
                        {
                            width: '*',
                            style: 'top',
                            text: `Class: ${student_data.class}`
                        },
                        {
                            width: 'auto',
                            style: 'top',
                            text: `Number in Class: ${stdNumber}`
                        },
                    ]
                },
                {
                    style: 'tableExample',
                    color: '#000',
                    table: {
                        widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                        // headerRows: 2,
                        body: tableItems
                    }
                },
                {
                    columns: [
                        {
                            width: '*',
                            style: 'bottom',
                            text: `NUMBER OF SUBJECTS: ${student_data.subjects.length}`
                        },
                        {
                            width: '*',
                            style: 'bottom',
                            text: `TOTAL OBTAINABLE MARKS: ${student_data.subjects.length * 100}`
                        },
                        {
                            width: 'auto',
                            style: 'bottom',
                            text: `MARKS OBTAINED: ${student_data.total}`
                        },
                    ]
                },
                {
                    columns: [
                        {
                            width: '*',
                            style: 'bottom',
                            text: `CLASS AVERAGE: ${student_data.average.toFixed(2)}`
                        },
                        {
                            width: '*',
                            style: 'bottom',
                            text: `POSITION IN CLASS: ${position_qualifier(student_data.position)}`
                        },
                        {
                            width: 'auto',
                            style: 'bottom',
                            text: `OUT OF CLASS: ${stdNumber}`
                        },
                    ]
                },
                {
                    style: 'bottom',
                    text: `PRINCIPAL\'S REMARKS: ${htremarkHelper(student_data.average)}`,
                },
                {
                    columns: [
                        {
                            width: '*',
                            style: 'bottom',
                            text: `NAME OF PRINCIPAL: ${school_data.school_info.p_name}`
                        },
                        {
                            width: 'auto',
                            style: 'bottom',
                            text: 'SIGNATURE/STAMP:   '
                        },
                        {
                            width: 'auto',
                            image: stamp,
                            fit: [40, 40],

                        },
                        {
                            width: 'auto',
                            style: 'bottom',
                            text: `DATE: ${date}`
                        },
                    ]
                },
            ],
            styles: {
                header: {
                    fontSize: 15,
                    bold: true,
                    margin: [0, 5, 0, 3]
                },
                subheader: {
                    fontSize: 13,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                top: {
                    bold: true,
                    fontSize: 11,
                    color: 'black',
                    margin: [0, 0, 0, 5]
                },
                bottom: {
                    bold: false,
                    fontSize: 10,
                    color: 'black',
                    margin: [0, 5, 0, 0]
                },
                tableOpacityExample: {
                    margin: [0, 5, 0, 15],
                    fillColor: 'blue',
                    fillOpacity: 0.3
                },
                tableHeader: {
                    bold: true,
                    fontSize: 9.5,
                    color: 'black'
                }
            },
            defaultStyle: {
                // alignment: 'justify'
            },
            patterns: {
                stripe45d: {
                    boundingBox: [1, 1, 4, 4],
                    xStep: 3,
                    yStep: 3,
                    pattern: '1 w 0 1 m 4 5 l s 2 0 m 5 3 l s'
                }
            }
        };

        var printer = new PdfPrinter(Roboto);

        var pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(fs.createWriteStream('document.pdf'));
        // pdfDoc.pipe(res);
        pdfDoc.end();


    } catch (error) {
        console.log(error);
        /*  return res.status(500).send({
             message: error.message,
         }); */
    }
};

connect();

function htremarkHelper(score) {
    if (score <= 100 && score >= 80) {
        return "Wonderful performance. Keep it up.";
    } else {
        if (score < 80 && score >= 70) {
            return "An Amazing Result. Keep it up";
        } else {
            if (score < 70 && score >= 60) {
                return "Good Result. You can do more";
            } else {
                if (score < 60 && score >= 50) {
                    return "Satisfactory Result. You can do better.";
                } else {
                    if (score < 50 && score >= 40) {
                        return "Average Result, Work harder";
                    } else if (score < 40 && score >= 0) {
                        return "Poor performance. Do better next time.";
                    } else {
                        return "Your Scores are not within the stipulated range. Form teacher please make corrections";
                    }
                }
            }
        }
    }
}
function position_qualifier(pos) {
    if (!isNaN(pos)) {
        if (p(pos, 1) || p(pos, 21) || p(pos, 31) || p(pos, 41) || p(pos, 51) || p(pos, 61) || p(pos, 71) || p(pos, 81) || p(pos, 91) || p(pos, 101) || p(pos, 121) || p(pos, 131) || p(pos, 141) || p(pos, 151) || p(pos, 161) || p(pos, 171) || p(pos, 181) || p(pos, 191) || p(pos, 201)) {
            return pos + "ST";
        }
        else {
            if (p(pos, 2) || p(pos, 22) || p(pos, 32) || p(pos, 42) || p(pos, 52) || p(pos, 62) || p(pos, 72) || p(pos, 82) || p(pos, 92) || p(pos, 102) || p(pos, 122) || p(pos, 132) || p(pos, 142) || p(pos, 152) || p(pos, 162) || p(pos, 172) || p(pos, 182) || p(pos, 192) || p(pos, 202)) {
                return pos + "ND";
            } else {
                if (p(pos, 3) || p(pos, 23) || p(pos, 33) || p(pos, 43) || p(pos, 53) || p(pos, 63) || p(pos, 73) || p(pos, 83) || p(pos, 93) || p(pos, 103) || p(pos, 123) || p(pos, 133) || p(pos, 143) || p(pos, 153) || p(pos, 163) || p(pos, 173) || p(pos, 183) || p(pos, 193) || p(pos, 203)) {
                    return pos + "RD";
                } else {
                    if (btw(pos, 4, 20) || btw(pos, 24, 30) || btw(pos, 34, 40) || btw(pos, 44, 50) || btw(pos, 54, 60) || btw(pos, 64, 70) || btw(pos, 74, 80) || btw(pos, 84, 90) || btw(pos, 94, 100) || btw(pos, 104, 120) || btw(pos, 124, 130) || btw(pos, 134, 140) || btw(pos, 144, 150) || btw(pos, 154, 160) || btw(pos, 164, 170) || btw(pos, 174, 180) || btw(pos, 184, 190) || btw(pos, 194, 200)) {
                        return pos + "TH";
                    } else {
                        return pos;
                    }
                }
            }
        }
    }
    else {
        return ''
    }
}
function p(pos, num) {
    if (pos === num) { return true; } else { return false; }
}
function btw(p, a, b) {
    if (p >= a && p <= b) { return true; } else { return false; }
}
function gradeHelper(score) {
    if (!isNaN(score)) {
        if (score <= 100 && score >= 75) {
            return "A";
        }
        else {
            if (score < 75 && score >= 65) {
                return "B";
            }
            else {
                if (score < 65 && score >= 55) {
                    return "C";
                }
                else {
                    if (score < 55 && score >= 40) {
                        return "D";
                    }
                    else {
                        if (score < 40 && score >= 0) {
                            return "E";
                        }
                        else {
                            return "-"
                        }
                    }
                }
            }
        }
    }
    else {
        return "-"
    }

}