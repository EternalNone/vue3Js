<script setup name="Login">
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const router = useRouter()

const loading = ref(false)
const loginFormRef = ref(null)
const loginFormData = reactive({
  userName: '',
  password: ''
})
const loginFormRules = {
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
const { userName, password } = toRefs(loginFormData)

const handleLogin = () => {
  loginFormRef.value?.validate((valid, fields) => {
    if (valid) {
      loading.value = true
      userStore
        .login({ userName: userName.value, password: password.value })
        .then(() => {
          router.push({ path: '/' })
        })
        .finally(() => {
          loading.value = false
        })
    } else {
      console.error('表单校验不通过', fields)
    }
  })
}
</script>
<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-logo">
        <img src="@/assets/images/logo.png" alt="logo" width="240" />
      </div>
      <div class="login-title">入所智能分析平台</div>
      <el-form
        ref="loginFormRef"
        :model="loginFormData"
        :rules="loginFormRules"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="userName">
          <el-input
            v-model.trim="userName"
            placeholder="用户名"
            clearable
            type="text"
            tabindex="1"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model.trim="password"
            placeholder="密码"
            clearable
            type="password"
            tabindex="2"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        <div class="login-actions">
          <div class="forget-password">忘记密码</div>
        </div>
        <el-button :loading="loading" type="primary" size="large" @click.prevent="handleLogin"
          >登 录</el-button
        >
      </el-form>
    </div>
    <video class="background-video" autoplay loop muted poster="@/assets/images/login_bg.jpg">
      <source src="@/assets/login_bg.mp4" type="video/mp4" />
    </video>
  </div>
</template>
<style lang="scss" scoped>
$color: rgba(17, 209, 251, 1);
$space: 30px;
.login-container {
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
  @include flex(column);
  .login-form {
    position: relative;
    width: 480px;
    padding: $space 50px 50px;
    z-index: 1;
    background: rgba(0, 0, 0, 0.6);
    box-shadow: 0px 0px 30px 0px rgba(17, 209, 251, 0.8);
    border-radius: 8px 8px 8px 8px;
    .login-logo {
      @include flex;
      margin-bottom: $space;
    }
    .login-title {
      width: 100%;
      margin-bottom: $space;
      text-align: center;
      font-weight: 600;
      font-size: 24px;
      color: $color;
      line-height: 28px;
      letter-spacing: 5px;
    }
    .login-actions {
      @include flex($jc: flex-end);
      .el-checkbox {
        --el-checkbox-input-border: 1px solid rgba(17, 209, 251, 1);
        --el-checkbox-bg-color: transparent;
        --el-checkbox-text-color: rgba(17, 209, 251, 1);
      }
      .forget-password {
        width: 100%;
        text-align: right;
        font-size: 14px;
        color: $color;
        line-height: 16px;
        letter-spacing: 1px;
        cursor: pointer;
      }
    }

    .el-form-item {
      margin-bottom: $space;
    }
    .el-input {
      --el-input-text-color: rgba(255, 255, 255, 1);
      --el-input-transparent-border: 0 0 0 1px transparent inset;
      --el-input-border-color: rgba(17, 209, 251, 0.5);
      --el-input-bg-color: transparent;
      --el-input-icon-color: rgba(17, 209, 251, 1);
      --el-input-placeholder-color: rgba(255, 255, 255, 0.8);
      --el-input-hover-border-color: rgba(17, 209, 251, 1);
      --el-input-clear-hover-color: rgba(17, 209, 251, 1);
      --el-input-focus-border-color: rgba(17, 209, 251, 1);
      :deep(.el-input__inner) {
        &:-webkit-autofill,
        &:-webkit-autofill:hover,
        &:-webkit-autofill:focus,
        &:-webkit-autofill:active {
          -webkit-transition-delay: 99999s;
          -webkit-transition:
            color 99999s ease-out,
            background-color 99999s ease-out;
        }
      }
    }
    .el-button {
      width: 100%;
      margin-top: $space;
      font-size: 20px;
    }
  }
  .background-video {
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 0;
  }
}
</style>
