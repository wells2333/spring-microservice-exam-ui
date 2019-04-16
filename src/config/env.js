let baseUrl
let iconfontVersion = ['567566_r22zi6t8noas8aor', '599693_0b5sleso3f1j1yvi', '667895_xte3dcfrvbo6r'];
let iconfontUrl = `//at.alicdn.com/t/font_$key.css`;
let codeUrl = `/api/user/v1/code`

if (process.env.NODE_ENV === 'development') {
  baseUrl = `http://127.0.0.1:9999/`
} else if (process.env.NODE_ENV === 'production') {	// 生产环境
  baseUrl = ''
}

export {
  baseUrl,
  iconfontUrl,
  iconfontVersion,
  codeUrl
}
