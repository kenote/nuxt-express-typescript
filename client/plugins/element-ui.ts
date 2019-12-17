import Vue from 'vue'
import { 
  Backtop,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Cascader, 
  Card,
  Carousel, 
  CarouselItem,
  Checkbox,
  CheckboxGroup,
  Col,
  Collapse,
  CollapseItem,
  DatePicker,
  Dialog,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Form, 
  FormItem, 
  Icon,
  Input, 
  InputNumber,
  Link,
  Loading, 
  Menu,
  MenuItem,
  Message, 
  MessageBox,
  Option,
  Pagination,
  Radio,
  RadioButton,
  RadioGroup,
  Row, 
  Select,
  Step,
  Steps,
  Submenu,
  Table,
  TableColumn,
  Tabs,
  TabPane,
  Timeline,
  Tag,
  TimelineItem,
  Tooltip,
  Transfer,
  Tree,
  Upload
} from 'element-ui'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'
// import locale from 'element-ui/lib/locale/lang/en'
import VueAMap from 'vue-amap'

export default () => {
  // Vue.use(Element, { locale })
  Vue.use(Backtop)
  Vue.use(Badge)
  Vue.use(Breadcrumb)
  Vue.use(BreadcrumbItem)
  Vue.use(Button)
  Vue.use(Cascader)
  Vue.use(Card)
  Vue.use(Carousel)
  Vue.use(CarouselItem)
  Vue.use(Checkbox)
  Vue.use(CheckboxGroup)
  Vue.use(Col)
  Vue.use(Collapse)
  Vue.use(CollapseItem)
  Vue.use(DatePicker)
  Vue.use(Dialog)
  Vue.use(Dropdown)
  Vue.use(DropdownItem)
  Vue.use(DropdownMenu)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Icon)
  Vue.use(Input)
  Vue.use(InputNumber)
  Vue.use(Link)
  Vue.use(Loading)
  Vue.use(Menu)
  Vue.use(MenuItem)
  Vue.use(Option)
  Vue.use(Pagination)
  Vue.use(Radio)
  Vue.use(RadioButton)
  Vue.use(RadioGroup)
  Vue.use(Row)
  Vue.use(Select)
  Vue.use(Step)
  Vue.use(Steps)
  Vue.use(Submenu)
  Vue.use(Table)
  Vue.use(TableColumn)
  Vue.use(Tabs)
  Vue.use(TabPane)
  Vue.use(Tag)
  Vue.use(Timeline)
  Vue.use(TimelineItem)
  Vue.use(Tooltip)
  Vue.use(Transfer)
  Vue.use(Tree)
  Vue.use(Upload)
  Vue.use(VueAMap)
  Vue.component(CollapseTransition.name, CollapseTransition)
  Vue.prototype.$message = Message
  Vue.prototype.$msgbox = MessageBox
  Vue.prototype.$alert = MessageBox.alert
  Vue.prototype.$confirm = MessageBox.confirm
  Vue.prototype.$prompt = MessageBox.prompt
  Vue.prototype.$loading = Loading.service
}
