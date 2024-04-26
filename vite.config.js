import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import path from 'path'
import process from 'process'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    VueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      eslintrc: {
        enabled: true // <-- this
      },
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: ['vue', 'vue-router', 'pinia']
    }),
    VueSetupExtend(),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    // svg组件
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), `src/assets/svgs`)], //文件路径一定需要写对
      symbolId: 'icon-[dir]-[name]'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 全局scss
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/common.scss" as *;`
      }
    }
  },
  server: {
    /** 设置 host: true 才可以使用 Network 的形式，以 IP 访问项目 */
    host: true, // host: "0.0.0.0"
    /** 端口号 */
    port: 3333,
    /** 是否自动打开浏览器 */
    open: false,
    /** 跨域设置允许 */
    cors: true,
    /** 端口被占用时，是否直接退出 */
    strictPort: false,
    /** 接口代理 */
    proxy: {
      "/api": {
        target: "http://192.168.21.125:8500/",
        ws: true,
        /** 是否允许跨域 */
        changeOrigin: true
      }
    },
    /** 预热常用文件，提高初始页面加载速度 */
    warmup: {
      clientFiles: ["./src/layouts/**/*.vue"]
    }
  },
})
