import type { IPublicTypeComponentMetadata } from '@alilc/lowcode-types'

const meta: IPublicTypeComponentMetadata = {
  componentName: 'Background',
  title: '背景',
  configure: {
    supports: {
      style: true,
    },
    component: {
      disableBehaviors: ['remove', 'copy', 'move'],
      isContainer: true,
    },
    props: [
      {
        name: 'bgImg',
        title: '背景图片',
        setter: {
          componentName: 'MixedSetter',
          props: {
            setters: ['PicSetter', 'StringSetter'],
          },
        },
      },
      {
        name: 'bgColor',
        title: '背景颜色',
        setter: {
          componentName: 'ColorSetter',
        },
      },
      {
        name: 'scrollable',
        title: {
          label: '滚动背景',
          tip: '如使用长图片并需要滚动，请打开此开关',
        },
        defaultValue: true,
        setter: {
          componentName: 'BoolSetter',
        },
      },
      {
        name: 'object-fit',
        title: {
          label: '背景渲染模式',
          tip: '仅在非滚动背景下有效',
        },
        setter: {
          componentName: 'RadioGroupSetter',
          props: {
            options: [
              {
                title: '保留长宽比不缩放',
                value: 'contain',
                tip: '如果宽高不够，将会有白边',
              },
              {
                title: '保留宽高比并裁剪',
                value: 'cover',
                tip: '将会裁剪以保证宽高充满屏幕',
              },
              {
                title: '充满屏幕并缩放',
                value: 'fill',
                tip: '长边或短边将可能会发生缩放行为',
              },
              {
                title: '按原尺寸渲染',
                value: 'none',
                tip: '将保持其原有的尺寸',
              },
              {
                title: '不设置',
                value: undefined,
              },
            ],
          },
        },
        condition: target => {
          return !target.getProps().getPropValue('scrollable')
        },
      },
    ],
  },
}

export default meta
