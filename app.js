const baseurl = "http://140.123.173.244:8080/fhir";

const express = require("express");
const app = express(); // 只會回傳一個function，可以()
const path = require("path");
const bodyParser = require("body-parser"); // module
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
const ejs = require("ejs");
const axios = require("axios");
const {
    response
} = require("express");
// const fetch = require("node-fetch");

// middleware
// app.use(bodyParser.urlencoded({
//     extended: false
// }));

app.use(express.static("public"));
app.set("view engine", "ejs");

// routing in express

// handle different request
app.get("/", (req, res) => {
    res.render("getPatient.ejs");
});

app.get("/test", (req, res) => {
    let url1 = "https://hapi.fhir.tw/fhir/Patient";
    let genderlist = [0, 0, 0];

    async function queryData() {
        let ret = await axios.get(url1);

        return ret.data;
    }

    queryData().then(ret => {

    });

    res.send("Thanks");
});

app.get("/dashboard", (req, res) => {
    let url1 = "https://hapi.fhir.tw/fhir/Patient";
    let genderlist = [0, 0, 0];
    let age = [];
    let agenum = [];
    let today = new Date();
    let year = today.getFullYear();
    let hasyear = false;
    var nexturl;

    axios
        .get(url1)
        .then((response) => {
            let patientList = response.data.entry;
            let patientNum = response.data.link;
            console.log(response.data.total);

            patientList.map(entry => {
                var genderdata = entry.resource.gender;
                var agedata = entry.resource.birthDate;

                if (genderdata == "male") {
                    genderlist[0] += 1;
                } else if (genderdata == "female") {
                    genderlist[1] += 1;
                } else {
                    genderlist[2] += 1;
                }

                if (agedata != undefined) {
                    year = year - agedata.substr(0, 4);

                    for (let i = 0; i <= age.length; i++) {
                        if (age[i] == year) {
                            agenum[i] += 1;
                            hasyear = true;
                            break;
                        }
                    }
                    if (hasyear == false) {
                        age[age.length] = year;
                        agenum[agenum.length] = 1;
                    }
                    hasyear = false;
                    year = today.getFullYear();
                }
            });

            if (patientNum.length > 0 && patientNum[1].relation === 'next') {
                var nexturl = patientNum[1].url;
                nextdata(nexturl);
            }

            console.log(genderlist); //男女人數

            res.setHeader('Content-Type', 'text/html');
            res.render("dashboard.ejs", {
                genderlist
            });
        })
        .catch((error) => {
            console.error(error);
        });

    function nextdata(url) {
        axios
            .get(url)
            .then((response) => {
                let patientList = response.data.entry;
                let patientNum = response.data.link;

                patientList.map(entry => {
                    var genderdata = entry.resource.gender;
                    var agedata = entry.resource.birthDate;

                    if (genderdata == "male") {
                        genderlist[0] += 1;
                    } else if (genderdata == "female") {
                        genderlist[1] += 1;
                    } else {
                        genderlist[2] += 1;
                    }

                    if (agedata != undefined) {
                        year = year - agedata.substr(0, 4);

                        for (let i = 0; i <= age.length; i++) {
                            if (age[i] == year) {
                                agenum[i] += 1;
                                hasyear = true;
                                break;
                            }
                        }
                        if (hasyear == false) {
                            age[age.length] = year;
                            agenum[agenum.length] = 1;
                        }
                        hasyear = false;
                        year = today.getFullYear();
                    }
                });

                if (patientNum.length > 0 && patientNum[1].relation === 'next') {
                    nexturl = patientNum[1].url;
                    nextdata(nexturl);
                }
                console.log(genderlist);
            })
            .catch((error) => {
                console.error(error);
            });

    }

});

app.get("/GetPatient", (req, res) => {
    let identifier = req.query.identifier;
    if (identifier == "") {
        res.sendFile(__dirname + "/errpage.html");
    } else {
        // let url = `https://hapi.fhir.tw/fhir/Patient?identifier=${identifier}`;
        let url1 = `http://140.123.173.244:8080/fhir/Patient?identifier=${identifier}`;

        let data;

        axios
            .get(url1)
            .then((response) => {
                let patientList = response.data.entry;
                patientList.map(entry => {
                    data = entry.resource;
                    console.log(data);
                    res.setHeader('Content-Type', 'text/html');
                    res.render("index.ejs", {
                        data
                    });
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }
});

app.post("/AddNewPatient", urlencodedParser, (req, res) => {
    let id = req.body.identifier;

    // let url = `https://hapi.fhir.tw/fhir/Patient?identifier=${identifier}`;
    let url1 = `http://140.123.173.244:8080/fhir/Observation?subject=${id}`;

    const fhirdata = {
        resourceType: 'Patient',
        identifier: [{
            use: 'usual',
            type: {
                text: '身分證字號'
            },
            value: $('#identifier').val(),
            assigner: {
                display: '內政部'
            }
        }],
        active: true,
        name: [{
            text: $('#name').val()
        }],
        gender: ($('#gender-male:checked').val()) ? 'male' : 'female',
        birthDate: $('#birthDate').val(),
        address: [{
            use: 'home',
            text: $('#address').val() || ''
        }],
        telecom: [{
            use: 'home',
            system: 'phone',
            value: $('#telecom').val() || ''
        }]
    };

    axios({
            method: 'post',
            url: url1,
            data: fhirdata
        })
        .then((response) => console.log(response))
        .catch((error) => {
            console.error(error);
        });
});

// app.get("/lee", (req, res) => {
//     // api
//     let lee = {
//         name: "Lee",
//         age: 23,
//     };
//     res.send(lee);
// });

// app.get("/mike", (req, res) => {
//     res.sendFile(__dirname + "/index.html");
// });

// // routing for query
// // GET方式不需要body-parser
// app.get("/formHandling", (req, res) => {
//     let {
//         fullname,
//         age,
//     } = req.query;
//     res.send("Thanks" + fullname);
// })

// POST方式
// app.post("/formHandling", (req, res) => {
//     let {
//         fullname,
//         age,
//     } = req.body;
//     res.send(`Thanks. ${fullname}, and your age is ${age}.`);
// });

// routing for pattern
// app.get("/fruit/:someFruit", (req, res) => {
//     let {
//         someFruit
//     } = req.params; //destructing an object
//     res.send("you are looking for " + someFruit);
//     //res.send("you are looking for " + req.params.someFruit);
// });

// routing for all
app.get("*", (req, res) => {
    res.send("Can't not find what you want");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});