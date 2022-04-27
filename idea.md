#### rich 的核心能力与实现思路

##### 1. 富文本与样式 (Styled Text)

- `rich` 能力：
  - 支持文本的颜色（前景色、背景色）、粗体、斜体、下划线、删除线、闪烁、反转等多种样式。
  - 支持样式组合，例如 `bold red on blue`。
  - 支持样式标签（类似 HTML/BBCode），如 `[bold red]Hello[/bold red] World`。
  - 自动处理 ANSI 转义码，确保样式正确应用。
  
- `Sillage` 实现思路：
  - 核心组件：`Text` 类。
  - 样式库：利用 `picocolors` (或 `chalk`) 来应用 ANSI 颜色和样式。
  - 链式调用：`new Text("Hello").red().bold().underline()`。
  - 样式标签解析：如果你想支持 `[tag]...[/tag]` 语法，你需要实现一个简单的解析器，将这种标签转换为 `Text` 对象的链式调用或内部样式表示。这会增加复杂性，但用户体验会很好。
  - 内部表示：`Text` 对象内部可能需要维护一个文本段落和对应样式的列表，而不是简单地将样式直接应用到整个字符串。例如：`[{ content: "Hello", styles: ["red", "bold"] }, { content: " World", styles: [] }]`。


##### 2. 面板 (Panel)

- `rich` 能力：
  - 将任何可渲染内容（文本、表格、其他面板等）包裹在可定制的边框内。
  - 支持多种边框样式（单线、双线、圆角、粗线等）。
  - 支持标题、内边距、内容对齐。
  - 自动适应终端宽度。

- `Sillage` 实现思路：
  - 核心组件：`Panel` 类。
  - 依赖：`string-width` (计算宽度)、`strip-ansi` (移除 ANSI 码)、`picocolors` (边框颜色)、`cli-boxes` (边框字符)。
  - 实现细节：
    - `Panel` 构造函数接受一个 `Renderable` 对象或字符串。
    - `render()` 方法：
      1. 递归调用内部内容的 `render()` 方法，获取其原始字符串。
      2. 使用 `stripAnsi` 和 `stringWidth` 计算内容的实际显示宽度。
      3. 根据内容宽度、内边距、边框样式和标题，计算整个面板的尺寸。
      4. 使用 `cli-boxes` 获取边框字符，并用 `picocolors` 给边框上色。
      5. 拼接顶部边框、标题、内容行（每行根据对齐方式填充空白）、底部边框。
      6. 难点：内容的自动换行。`rich` 的 `Panel` 会在内容超出宽度时自动换行。这需要一个复杂的文本包装器，它能处理带 ANSI 码的字符串并按字或词进行换行。


##### 3. 表格 (Table)

- `rich` 能力：
  - 创建美观的、可定制的表格。
  - 支持列宽、列对齐、列样式、表头样式。
  - 支持单元格内容换行。
  - 支持表标题、表脚。
  - 支持多种边框样式。

- `Sillage` 实现思路：
  - 核心组件：`Table` 类。
  - API：`addColumn()`, `addRow()`, `title()`, `footer()`, `border()`, `columnWidth()` 等。
  - 实现细节：
    - 列宽计算：根据内容自动计算每列的最佳宽度，或允许用户指定固定宽度。
    - 单元格内容处理：每个单元格的内容可以是 `Text` 或其他 `Renderable`。需要处理单元格内容的自动换行和对齐。
    - 边框绘制：与 `Panel` 类似，使用 `cli-boxes` 绘制表格内部和外部的边框。
    - 性能：对于大型表格，需要优化渲染性能。


##### 4. 进度条 (Progress Bars)

- `rich` 能力：
  - 显示动态更新的、多任务的进度条。
  - 支持任务描述、进度百分比、速度、剩余时间等信息。
  - 支持多种进度条样式。
  - 在终端底部自动刷新，不干扰其他输出。

- `Sillage` 实现思路：
  - 核心组件：`Progress` 类。
  - 依赖：`log-update` (或手动光标控制) 来实现无闪烁刷新。
  - API：`add_task()`, `update()`, `start()`, `stop()`, `run()` (上下文管理器模式)。
  - 实现细节：
    - 任务管理：内部维护一个任务列表，每个任务有自己的进度、描述等。
    - 渲染循环：使用 `setInterval` 定期调用 `log-update` 来刷新整个进度条区域。
    - 计算：计算百分比、速度（需要记录时间戳和进度变化）、剩余时间。
    - 多任务布局：将多个任务的进度条垂直排列。


##### 5. 语法高亮 (Syntax Highlighting)
- `rich` 能力：
  - 对代码块进行语法高亮，支持多种语言。
  - 通常与 `Code` 组件结合使用。

- `Sillage` 实现思路：
  - 核心组件：`Code` 类。
  - 依赖：`cli-highlight` (你已经选定)。
  - 实现细节：`Code` 组件的 `render()` 方法内部调用 `cli-highlight` 来获取高亮后的代码字符串。


##### 6. Markdown 渲染 (Markdown Rendering)

- `rich` 能力：
  - 将 Markdown 字符串直接渲染成美观的终端输出，包括标题、列表、代码块、引用、表格等。

- `Sillage` 实现思路：
  - 核心模块：一个独立的 `renderMarkdown()` 函数。
  - 依赖：`marked` (解析 Markdown 为 AST)。
  - 实现细节：
    - 实现一个自定义的 `marked` 渲染器 (Renderer)。
    - 在渲染器中，将 `marked` 解析出的每个 Markdown 元素（如 `heading`, `list`, `code`, `table`, `paragraph` 等）映射到你 `Sillage` 库中对应的 `Text`, `Panel`, `Table`, `Code` 等组件。
    - 例如，`marked` 的 `heading()` 方法会返回一个 `Text` 对象，并应用相应的样式。`marked` 的 `table()` 方法会返回一个 `Table` 对象。


##### 7. 布局与列 (Layout & Columns)

- `rich` 能力：
  - 将多个内容块并排显示在列中。
  - 支持自动调整列宽以适应内容和终端宽度。

- `Sillage` 实现思路：
  - 核心组件：`Columns` 类。
  - API：`add()`, `setColumns()`, `align()` 等。
  - 实现细节：
    - 接受一个 `Renderable` 数组。
    - 计算每个 `Renderable` 的渲染宽度。
    - 根据终端宽度和列配置，分配每列的宽度。
    - 将每个 `Renderable` 渲染成多行字符串，并进行垂直对齐。
    - 难点：处理不同高度的列，确保各列内容正确对齐。


##### 8. 规则/分隔符 (Rule)

- `rich` 能力：
  - 绘制带标题或不带标题的水平线。
  - 常用于分隔内容块。

- `Sillage` 实现思路：
  - 核心组件：`Rule` 类。
  - API：`title()`, `lineChar()`, `style()` 等。
  - 实现细节：
    - 根据终端宽度，计算横线长度。
    - 如果存在标题，将标题放置在横线中间，并用横线填充两侧。
    - 应用颜色和样式。


##### 9. 动态显示 (Live Display)

- `rich` 能力：
  - 在终端的特定区域动态更新内容，而不会清空整个屏幕或导致闪烁。
  - 是实现进度条、Spinner、交互式表单等的基础。

- `Sillage` 实现思路：
  - 核心组件：`LiveDisplay` 类。
  - 依赖：`log-update` (或手动光标移动和清除行)。
  - API：`start()`, `update()`, `stop()`, `with()` (上下文管理器)。
  - 实现细节：
    - 记录当前显示内容的行数。
    - `update()` 时，先清除旧内容，再打印新内容。
    - 使用 `process.stdout.cursorTo` 和 `process.stdout.clearLine` 进行光标控制。


##### 10. 错误回溯美化 (Traceback Formatting)

- `rich` 能力：
  - 美化 Python 程序的错误回溯信息，使其更易读，并高亮关键信息。

- `Sillage` 实现思路：
  - 核心模块：一个 `formatError()` 或 `prettyTraceback()` 函数。
  - 依赖：需要解析 Node.js 的错误堆栈字符串。
  - 实现细节：
    - 捕获 `process.on('uncaughtException')` 或 `process.on('unhandledRejection')`。
    - 解析 `Error.stack` 字符串，提取文件名、行号、函数名等信息。
    - 使用你的 `Text` 组件和 `Code` 组件（如果能获取到源代码片段）来美化输出。


##### 11. 日志集成 (Logging Integration)

- `rich` 能力：
  - 与 Python 的 `logging` 模块集成，将日志输出美化。

- `Sillage` 实现思路：
  - 核心模块：一个 `SillageTransport` (如果你使用 `Winston` 或 `Pino`)。
  - 实现细节：
    - 创建一个自定义的 `Winston` 或 `Pino` 传输器 (Transport)。
    - 在这个传输器中，将日志消息（根据级别、元数据等）使用你的 `Text`、`Panel` 等组件进行格式化，然后通过你的 `console.print()` 输出。


##### 12. Emoji 支持
- `rich` 能力：
  - 自动将 `:emoji_name:` 转换为实际的 Emoji 字符。

- `Sillage` 实现思路：
  - 依赖：`node-emoji` 或类似的库。
  - 实现细节：在你的 `Text` 组件或一个通用的后处理函数中，扫描文本中的 `:emoji_name:` 模式并替换。