import fs from 'fs'
import path from 'path'

function buildTree(dir, prefix = '') {
  let output = ''
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return ''
  }

  // جلب الملفات وتصفية الملفات غير المهمة
  const files = fs
    .readdirSync(dir)
    .filter((file) => !['.DS_Store', 'node_modules', 'dist', '.git'].includes(file))

  files.forEach((file) => {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      output += `${prefix}├── [DIR] ${file}\n`
      output += buildTree(fullPath, `${prefix}│   `)
    } else {
      output += `${prefix}├── ${file}\n`
    }
  })

  return output
}

const currentDir = process.cwd()
console.log('جاري فحص مجلد الواجهة الأمامية (src) والملفات الأساسية...')

let treeStructure = ''

// الفحص المركز على مجلد src فقط
const srcPath = path.join(currentDir, 'src')
if (fs.existsSync(srcPath)) {
  treeStructure += '============ [ VUE SRC FOLDER ] ============\n'
  treeStructure += buildTree(srcPath)
} else {
  treeStructure += 'تنبيه: لم يتم العثور على مجلد src في هذا المسار.\n'
}

// حفظ النتيجة في ملف نصي نظيف
fs.writeFileSync('frontend_tree_filtered.txt', treeStructure)

console.log('اكتمل الأمر بنجاح! تم إنشاء ملف يحمل اسم: frontend_tree_filtered.txt')
