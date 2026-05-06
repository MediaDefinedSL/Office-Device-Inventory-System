const fs = require('fs');
const path = require('path');

const pagesDir = 'd:\\github\\Media Defined new\\Office-Device-Inventory-System\\Frontend\\src\\pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    const loadingRegex = /if\s*\(\s*loading\s*\)\s*\{\s*return\s*\([\s\S]*?animate-spin[\s\S]*?\);\s*\}/g;
    
    if (loadingRegex.test(content)) {
        content = content.replace(loadingRegex, 'if (loading) {\n        return <SkeletonLoader />;\n    }');
        
        if (!content.includes('import SkeletonLoader')) {
            // Find the position after the last import statement
            const importRegex = /^import\s+.*?(?:from\s+['"].*?['"]|['"].*?['"]);?/gm;
            let lastMatch = null;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                lastMatch = match;
            }
            
            if (lastMatch) {
                const insertPos = lastMatch.index + lastMatch[0].length;
                content = content.slice(0, insertPos) + "\nimport SkeletonLoader from '../components/SkeletonLoader';" + content.slice(insertPos);
            } else {
                content = "import SkeletonLoader from '../components/SkeletonLoader';\n" + content;
            }
        }
        
        fs.writeFileSync(filePath, content);
        console.log('Updated ' + file);
    }
});
