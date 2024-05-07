<script setup name="JsList">
const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL // 对应环境的图片域名及端口

const props = defineProps({
  jsData: {
    type: Array,
    default: () => [],
    required: true
  }
})
console.log('ssssssssssss', props.jsData)
const { jsData } = toRefs(props)
</script>

<template>
  <div class="js-render">
    <el-row :gutter="20">
      <el-col
        v-for="item in jsData"
        :key="item.imgPath"
        class="js-item"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="4"
      >
        <div class="img">
          <el-image :src="imgBaseUrl + item.imgPath" lazy></el-image>
        </div>
        <div v-if="item.faultFrames.length" class="title">
          <div
            v-for="it in item.faultFrames"
            :key="it.id"
            :class="item.faultFrames.length > 1 ? 'fault-item fault-item-single' : 'fault-item'"
          >
            <span class="fault" :class="it.affirm === '1' ? '' : 'not-fault'">
              {{ it.affirm === '1' ? '正报' : '误报' }}
            </span>
            <span>{{ it.faultDesc }}</span>
          </div>
        </div>
        <div v-else class="title">{{ `图片路径：${item.imgPath}` }}</div>
        <div class="status" :class="item.faultFrames.length ? '' : 'normal'">
          {{ item.faultFrames.length ? '异常' : '正常' }}
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.js-render {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  @include scrollBar(
    $color: var(--el-color-primary-light-5),
    $activeColor: var(--el-color-primary)
  );
  @include flex() {
    flex-wrap: wrap;
    gap: 20px;
  }
  .el-row {
    width: calc(100% + 20px);
    height: 100%;
    .js-item {
      margin: 10px 0;
      position: relative;
      cursor: pointer;
      .img {
        width: 100%;
        overflow: hidden;
        aspect-ratio: 1.3;
        .el-image {
          width: 100%;
          height: 100%;
          transition: all 0.3s;
          &:hover {
            transform: scale(1.1);
          }
        }
      }
      .title {
        width: 100%;
        height: 60px;
        background: #ffffff;
        padding: 6px;
        font-size: 14px;
        line-height: 24px;
        font-weight: 400;
        color: #666;
        word-break: break-all;
        @include multiTextEllipsis(2);
        .fault-item {
          vertical-align: baseline;
          text-align: left;
          &.fault-item-single {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        .fault {
          padding: 0 6px;
          border-radius: 12px;
          background: var(--el-color-danger);
          line-height: 24px;
          text-align: center;
          font-size: 12px;
          font-weight: 400;
          color: #ffffff;
          margin-right: 6px;
          vertical-align: baseline;
          &.not-fault {
            background: var(--el-color-success);
          }
        }
      }
      .status {
        position: absolute;
        top: 6px;
        right: 10px;
        width: 50px;
        height: 24px;
        border-radius: 12px 0 0 12px;
        background: var(--el-color-danger);
        line-height: 24px;
        text-align: center;
        font-size: 14px;
        font-family:
          Microsoft YaHei,
          Microsoft YaHei;
        font-weight: 400;
        color: #ffffff;
        &.normal {
          background: var(--el-color-success);
        }
      }
    }
  }
}
</style>
