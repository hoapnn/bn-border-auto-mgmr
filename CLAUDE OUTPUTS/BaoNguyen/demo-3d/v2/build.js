/*
 * Đóng gói thành MỘT file HTML (v2) tự chứa (mở trực tiếp bằng trình duyệt, không cần máy chủ).
 * Chạy: node build.js            → BaoNguyen_Demo3D_v2.html
 *       node build.js <đường dẫn> --fragment  → bản không có <!doctype>/<html> (để đăng Artifact)
 */
'use strict';
const fs = require('fs'); const path = require('path');
const dir = __dirname;
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
const inline = (code) => '<script>\n' + code.replace(/<\/script/gi, '<\\/script') + '\n</script>';
let body = read('page.html').replace('<!--HW-->', () => inline(read('hardware.js'))).replace('<!--SIM_CORE-->', () => inline(read('sim-core.js'))).replace('<!--PLAN-->', () => inline(read('plan-image.js'))).replace('<!--APP-->', () => inline(read('app.js')));
const args = process.argv.slice(2);
const fragment = args.includes('--fragment');
const out = args.find(a => !a.startsWith('--')) || path.join(dir, 'BaoNguyen_Demo3D_v2.html');
const html = fragment ? body
  : '<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>body{margin:0}[hidden]{display:none!important}</style>\n</head>\n<body>\n' + body + '\n</body>\n</html>\n';
fs.writeFileSync(out, html);
console.log('Đã ghi', out, (html.length / 1024).toFixed(0) + ' KB');
