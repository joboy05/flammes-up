const fs = require('fs');
let code = fs.readFileSync('views/HubView.tsx', 'utf8');

const regex = /const primaryServices = \[\n    const primaryServices = \[\n/;
if (regex.test(code)) {
    code = code.replace(regex, 'const primaryServices = [\n');
    fs.writeFileSync('views/HubView.tsx', code);
    console.log("Fixed duplicate primaryServices");
} else {
    console.log("No duplicate primaryServices found");
}
