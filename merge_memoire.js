const fs = require('fs');
const path = require('path');

const brainDir = 'c:/Users/rayan/.gemini/antigravity/brain/45bbc498-02cd-49a7-849a-274af8d18907';
const targetFile = path.join(brainDir, 'MEMOIRE_FINAL_COMPLET.md');

const filesToMerge = [
  'pages_preliminaires.md',
  'chapitre_1_complet.md',
  'chapitre_2_complet.md',
  'chapitre_3_complet.md',
  'chapitre_4_conclusion_biblio.md'
];

let finalContent = '';

filesToMerge.forEach((fileName, index) => {
  const filePath = path.join(brainDir, fileName);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    finalContent += content + '\n\n---\n\n';
    console.log(`Merged: ${fileName}`);
  } else {
    console.error(`File NOT found: ${fileName}`);
  }
});

fs.writeFileSync(targetFile, finalContent);
console.log(`\nSUCCESS: Final memoire created at ${targetFile}`);
