local src_dir = vim.fn.getcwd() .. "/src/"
local out_dir = vim.fn.getcwd() .. "/out/"

vim.api.nvim_create_autocmd("BufWritePost", {
  group = vim.api.nvim_create_augroup('trim-on-save', { clear = true }),
  pattern = "*.frag",
  callback = function(ev)
    local file = ev.match

    if not vim.startswith(file, src_dir) then
      vim.notify("Current file is not under " .. src_dir, vim.log.levels.WARN)
      return
    end

    local lines = vim.fn.readfile(file)

    for i, line in ipairs(lines) do
      if vim.endswith(line, "end of the dev setup") then
        lines = vim.list_slice(lines, i + 1)

        if lines[1] == "" then
          table.remove(lines, 1)
        end

        break
      end
    end

    local filtered_lines = {}
    local in_block_comment = false

    for _, line in ipairs(lines) do
      if line:match("^%s*/%*") then
        in_block_comment = true
      end

      if not in_block_comment then
        local sub_line, count = line:gsub("//.*", "")
        if count <= 0 then
          table.insert(filtered_lines, line)
        elseif sub_line:match("%S") then
          table.insert(filtered_lines, sub_line)
        end
      end

      if line:match("%*/") then
        in_block_comment = false
      end
    end

    lines = filtered_lines

    local relative_path = file:sub(#src_dir + 1)
    local out_path = vim.fs.joinpath(out_dir, relative_path)

    vim.fn.mkdir(vim.fs.dirname(out_path), "p")
    vim.fn.writefile(lines, out_path)
  end,
})
