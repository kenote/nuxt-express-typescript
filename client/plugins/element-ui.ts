import Vue from 'vue'
import { 
  Breadcrumb,
  BreadcrumbItem,
  Button, 
  Carousel, 
  CarouselItem,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Form, 
  FormItem, 
  Input, 
  Loading, 
  Menu,
  MenuItem,
  Message, 
  Radio,
  RadioGroup,
  Row, 
  Submenu
} from 'element-ui'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'
// import locale from 'element-ui/lib/locale/lang/en'

export default () => {
  // Vue.use(Element, { locale })
  Vue.use(Breadcrumb)
  Vue.use(BreadcrumbItem)
  Vue.use(Button)
  Vue.use(Carousel)
  Vue.use(CarouselItem)
  Vue.use(Col)
  Vue.use(Dropdown)
  Vue.use(DropdownItem)
  Vue.use(DropdownMenu)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Input)
  Vue.use(Loading)
  Vue.use(Menu)
  Vue.use(MenuItem)
  Vue.use(Radio)
  Vue.use(RadioGroup)
  Vue.use(Row)
  Vue.use(Submenu)
  Vue.component(CollapseTransition.name, CollapseTransition)
  Vue.prototype.$message = Message
}
