/**
 * @typedef {Object} SelectConfig
 * @property {{labelKey: string, valueKey: string}} [opsKV] - 下拉选项的文本和值的字段名
 * @property {string[]} [connectKey] - 需要拼接在下拉选项文本中的字段名列表
 * @property {Array} [options] - 下拉选项
 * @property {Function} [qFunc] - 查询下拉选项的方法
 * @property {Object} [qParams] - 查询下拉选项的参数
 * @property {string} [remoteKey] - 远程搜索的字段名
 * @property {any} [key: string] - 其他未列举的任意属性(element-plus select相关配置项)
 */
/**
 * @typedef {Object} Column
 * @property {string} label - 列名
 * @property {string} prop - 列对应的属性名
 * @property {string} [slot] - 列的插槽名
 * @property {string} [headerSlot] - 列的表头插槽
 * @property {string | number} [width] - 列的宽度
 * @property {string | number} [minWidth] - 列的宽度
 * @property {boolean} [sortable] - 是否可排序
 * @property {boolean} [ellipsis] - 是否自动省略超出部分
 * @property {boolean | "left" | "right"} [fixed] - 列是否固定、固定方式
 * @property {'center' | 'left' | 'right'} [align] - 列的对齐方式
 * @property {'center' | 'left' | 'right'} [headerAlign] - 列的表头对齐方式
 * @property {boolean} [hideInTable] - 是否在表格中隐藏
 * @property {boolean} [showInSearch] - 是否在查询条件中显示
 * @property {string} [searchKey] - 查询条件的字段名，默认取prop值，不一致时需要指定
 * @property {"input" | "select" | "date" | "daterange"} [searchType] - 查询条件的类型
 * @property {string} [depKey] - 联动查询的字段名
 * @property {SelectConfig} [searchConfig] - 查询条件的配置,具体参考element-plus相关控件的配置
 * @property {Array<Column>} [childColumn] - 多级表头配置
 */
/**
 * 函数接口
 *
 * @callback SelectableFunc
 * @param {{ row: object, index: number }} data - 包含row和index的一个对象
 * @returns {boolean} 返回一个布尔值
 */
/**
 * @typedef {Object} Options
 * @property {string} [rowKey] - 表格行唯一标识，默认是id
 * @property {'' | 'large' | 'default' | 'small'} [size] - 表格尺寸
 * @property {'fixed' | 'auto'} [tableLayout] - 表格布局
 * @property {boolean} [stripe] - 是否展示斑马纹
 * @property {boolean} [border] - 是否展示边框
 * @property {boolean} [showHeader] - 是否展示表头
 * @property {"multiple" | "single"} [selectionType] - 选择模式-单选、多选
 * @property {boolean} [showIndex] - 是否展示索引
 * @property {boolean} [showExpand] - 是否支持展开
 * @property {boolean} [showPagination] - 是否支持分页
 * @property {Function} [selectableFunc] - 判断当前行是否可以选中的函数
 * @property {Function} qFunc - 表格的查询api
 * @property {object} initQObj - 初始查询参数
 */
