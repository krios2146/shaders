vim.api.nvim_create_autocmd("BufWritePost", {
  group = vim.api.nvim_create_augroup('trim-on-save', { clear = true }),
  pattern = "*_dev.frag",
  callback = function(ev)
    local path = vim.api.nvim_buf_get_name(ev.buf)
    local out = path:gsub("_dev(%.[^./]*)$", "%1")
    local lines = vim.fn.readfile(path)
    vim.fn.writefile(vim.list_slice(lines, 12), out)
  end,
})
