import Vue from 'vue'
import { 
  Backtop,
  Breadcrumb,
  BreadcrumbItem,
  Button, 
  Carousel, 
  CarouselItem,
  Col,
  Collapse,
  CollapseItem,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Form, 
  FormItem, 
  Icon,
  Input, 
  Loading, 
  Menu,
  MenuItem,
  Message, 
  Radio,
  RadioGroup,
  Row, 
  Submenu,
  Tabs,
  TabPane,
  Timeline,
  TimelineItem
} from 'element-ui'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'
// import locale from 'element-ui/lib/locale/lang/en'
import VueAMap from 'vue-amap'

export default () => {
  // Vue.use(Element, { locale })
  Vue.use(Backtop)
  Vue.use(Breadcrumb)
  Vue.use(BreadcrumbItem)
  Vue.use(Button)
  Vue.use(Carousel)
  Vue.use(CarouselItem)
  Vue.use(Col)
  Vue.use(Collapse)
  Vue.use(CollapseItem)
  Vue.use(Dropdown)
  Vue.use(DropdownItem)
  Vue.use(DropdownMenu)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Icon)
  Vue.use(Input)
  Vue.use(Loading)
  Vue.use(Menu)
  Vue.use(MenuItem)
  Vue.use(Radio)
  Vue.use(RadioGroup)
  Vue.use(Row)
  Vue.use(Submenu)
  Vue.use(Tabs)
  Vue.use(TabPane)
  Vue.use(Timeline)
  Vue.use(TimelineItem)
  Vue.use(VueAMap)
  Vue.component(CollapseTransition.name, CollapseTransition)
  Vue.prototype.$message = Message
}
