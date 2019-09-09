
import { KeyMap, Maps } from 'kenote-config-helper'

declare namespace homepage {

  interface Page {
    class              : string
    header             : Header
    bodyer             : Bodyer
  }

  /**
   * 头部设置
   */
  interface Header {

    /**
     * 样式
     */
    style               : string

    /**
     * Summit 图片
     */
    summit             ?: string

    /**
     * 滑动视图
     */
    slide              ?: Slide

  }

  /**
   * 滑动视图
   */
  interface Slide {

    /**
     * 大标题
     */
    title               : Transition

    /**
     * 副标题
     */
    subTitle            : Transition

    /**
     * 按钮区
     */
    buttons            ?: Transition
  }

  /**
   * 过渡动画
   */
  interface Transition {

    /**
     * 进场
     */
    enterActive        ?: string

    /**
     * 出场
     */
    leaveActive        ?: string

    /**
     * 内容
     */
    content             : string | string[] | ButtonLink[]
  }

  /**
   * 按钮链接
   */
  interface ButtonLink {

    /**
     * 类型
     */
    type                : string

    /**
     * 名称
     */
    name                : string

    /**
     * 链接
     */
    link                : string

    /**
     * 打开方式
     */
    target             ?: string
  }

  /**
   * 中间部分
   */
  interface Bodyer {

    /**
     * 普通信息
     */
    utits              ?: Utit[]

    sections           ?: Section[]
  }

  /**
   * 普通信息
   */
  interface Utit {
    type                : string
    title               : string
    icon               ?: string
    content             : string | string[] | Utit[] | JoinItem[] | ContactUtit[] | string[][]
    groups             ?: JoinUtit[] | LinkUtit[] | CardUtit[] | Utit[]
    mailto             ?: string
    button             ?: string[]
  }

  interface ContactUtit {
    type                : string
    title               : string
    amap                : Maps<any>
    content             : KeyMap<string>
  }

  interface LinkUtit {
    title               : string
    link               ?: string
    logo               ?: string
  }

  interface CardUtit {
    title               : string
    content             : string
    icon                : string
    button             ?: string[]
  }

  /**
   * 招聘信息组
   */
  interface JoinUtit {
    title               : string
    content             : JoinItem[]
  }

  /**
   * 招聘信息模型
   */
  interface JoinItem {
    title               : string
    location            : string
    description         : string[]
    requirements        : string[]
    priority           ?: string[]
  }

  /**
   * 通栏块
   */
  interface Section {

    /**
     * 样式类名
     */
    className          ?: string

    /**
     * 背景
     */
    background         ?: Background

    /**
     * 容器
     */
    container          ?: Container
  }

  /**
   * 背景
   */
  interface Background {

    /**
     * 样式
     */
    style              ?: string

    /**
     * 内背景
     */
    inner              ?: string

    /**
     * 外背景
     */
    outside            ?: string

  }

  /**
   * 容器
   */
  interface Container {

    /**
     * 类型
     */
    type                : string

    /**
     * 样式类名
     */
    className          ?: string

    /**
     * 标题
     */
    title              ?: string

    /**
     * 副标题/内容
     */
    content            ?: string | string[]

    /**
     * 
     */
    groups             ?: GroupItem[]

    /**
     * 按钮；[ 样式类名, 按钮文字, 链接地址 ]
     */
    button             ?: string[]

    /**
     * 链接；[ 链接地址, 打开目标 ]
     */
    link               ?: string[]
  }

  interface GroupItem {

    /**
     * 标题
     */
    title               : string

    /**
     * 内容
     */
    content            ?: string | Array<string | GroupItem> | GroupItem[] | GroupItem[][]

    /**
     * 高德地图
     */
    amap               ?: AMap

    /**
     * 图标/图像
     */
    image              ?: string

    /**
     * 按钮；[ 样式类名, 按钮文字, 链接地址 ]
     */
    button             ?: string[]

    /**
     * 链接；[ 链接地址, 打开目标 ]
     */
    link               ?: string[]
  }

  /**
   * 高德地图
   */
  interface AMap {

    /**
     * 区域位置坐标
     */
    center              : string[]

    /**
     * 描点位置坐标
     */
    position           ?: string[]
  }
}

export = homepage