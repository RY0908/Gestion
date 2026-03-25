const fs = require('fs');
const path = require('path');

const replacements = [
    { old: /'IT_MANAGER'/g, new: "'SUPERVISEUR'" },
    { old: /"IT_MANAGER"/g, new: '"SUPERVISEUR"' },
    { old: /IT_MANAGER:/g, new: 'SUPERVISEUR:' },
    { old: /'IT_TECHNICIAN'/g, new: "'TECHNICIEN'" },
    { old: /"IT_TECHNICIAN"/g, new: '"TECHNICIEN"' },
    { old: /IT_TECHNICIAN:/g, new: 'TECHNICIEN:' },
    { old: /'EMPLOYEE'/g, new: "'UTILISATEUR'" },
    { old: /"EMPLOYEE"/g, new: '"UTILISATEUR"' },
    { old: /EMPLOYEE:/g, new: 'UTILISATEUR:' },
    { old: /Responsable IT/g, new: 'Superviseur' },
    { old: /Technicien IT/g, new: 'Technicien Helpdesk' },
    { old: /Employé/g, new: 'Agent Sonatrach' }
];

function processDirectory(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            count += processDirectory(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content;
            
            for (const r of replacements) {
                newContent = newContent.replace(r.old, r.new);
            }
            
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log('Updated', file);
                count++;
            }
        }
    }
    return count;
}

const total = processDirectory(path.join(__dirname, 'src'));
console.log('Total files updated:', total);
