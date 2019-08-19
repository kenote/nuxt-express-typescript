import Vue from 'vue'
import { 
  Button, 
  Carousel, 
  CarouselItem,
  Form, 
  FormItem, 
  Input, 
  Loading, 
  Message, 
  Radio,
  RadioGroup,
  Row, 
} from 'element-ui'
// import locale from 'element-ui/lib/locale/lang/en'

export default () => {
  // Vue.use(Element, { locale })
  Vue.use(Button)
  Vue.use(Carousel)
  Vue.use(CarouselItem)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Input)
  Vue.use(Loading)
  Vue.use(Radio)
  Vue.use(RadioGroup)
  Vue.use(Row)
  Vue.prototype.$message = Message
}
