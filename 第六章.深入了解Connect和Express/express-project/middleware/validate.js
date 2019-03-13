const parseField = (field) => {
    // 将 entry[filed] 解析为 ['entry', 'filed']
    return field.split(/\[|\]/g).filter((s) => s)
}

const getField = (req, field) => {
    // 这个骚操作，我醉了！ 首先val = req.body， 然后val = val[entry], 然后val = entry.filed
    let val = req.body
    field.forEach((prop) => {
        val = val[prop]
    })
    return val
}

exports.required = (field) => {
    field = parseField(field)
    return (req, res, next) => {
        if (getField(req, field)) {
            next()
        } else {
            res.render('error，你必须输入标题')
            res.redirect('back')
        }
    }
}

exports.lengthAbove = (field, len) => {
    field = parseField(field)
    return (req, res, next) => {
        if (getField(req, field).length > len) {
            next()
        } else {
            res.render(`error，你内容必须超过${len}个长度`)
            res.redirect('back')
        }
    }
}
