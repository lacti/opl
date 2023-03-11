val select1 = SelectModel("select1")
  .source("https://")
  .model(SelectModel(
    label = "label",
    value = "value",
  ))
  .help("");
val input1 = InputModel("input1")
  .help("");

val table1 = TableModel<T>("table1")
  // .source(CompositeSource(
  //   template = "https://api/{}/{}",
  //   args = [select1, input1],
  // ))
  .source("https://api/${ref(select1)}/${ref(input1)}")
  .fields([
    StringColumn("aa"),
    StringColumn("bb"),
    Column(ButtonModel()
      .source("https://${ref(input1)}/${row<T>(...)}"))
  ])
  .help("");

fun ref(varName: String) = ":${varName}"

// audit
val table2 = TableModel("audit-log")
    .source("...")
    .help("");
