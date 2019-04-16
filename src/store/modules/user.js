import { loginByUsername, logout, getUserInfo } from '@/api/admin/login'
import { setToken, removeToken, setRefreshToken, removeRefreshToken } from '@/utils/auth'
import { setStore, getStore } from '@/utils/store'
import { encryption, getAttachmentPreviewUrl, isNotEmpty } from '@/utils/util'
import { GetMenu } from '@/api/admin/menu'
import { validatenull } from '@/utils/validate'

const user = {
  state: {
    userInfo: getStore({
      name: 'userInfo'
    }) || {},
    permissions: getStore({
      name: 'permissions'
    }) || {},
    roles: getStore({
      name: 'roles'
    }) || [],
    menu: getStore({
      name: 'menu'
    }) || [],
    isInitMenu: getStore({
      name: 'isInitMenu'
    }) || false,
    access_token: getStore({
      name: 'access_token'
    }) || '',
    refresh_token: getStore({
      name: 'refresh_token'
    }) || ''
  },
  actions: {
    // 根据用户名登录
    LoginByUsername({
      commit,
      state,
      dispatch
    }, userInfo) {
      return new Promise((resolve, reject) => {
        const user = encryption({
          data: userInfo,
          key: '1234567887654321',
          param: ['password']
        })

        loginByUsername(user.username, user.password, user.code, user.randomStr).then(response => {
          const data = response.data
          setToken(data.access_token)
          setRefreshToken(data.refresh_token)
          commit('SET_ACCESS_TOKEN', data.access_token)
          commit('SET_REFRESH_TOKEN', data.refresh_token)
          commit('CLEAR_LOCK')
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    GetUserInfo({
      commit,
      state,
      dispatch
    }) {
      return new Promise((resolve, reject) => {
        getUserInfo(state.token).then(response => {
          const data = response.data.data
          // 获取系统配置
          const sysConfig = getStore({ name: 'sys_config' })
          if (!isNotEmpty(data.user.avatarId)) {
            // 采用默认头像
            data.user.avatarUrl = sysConfig.defaultAvatar
          } else {
            data.user.avatarUrl = getAttachmentPreviewUrl(sysConfig, data.user.avatar)
          }
          commit('SET_ROLES', data.roles)
          commit('SET_USER_INFO', data.user)
          commit('SET_PERMISSIONS', data.permissions)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 登出
    LogOut({
      commit,
      state
    }) {
      return new Promise((resolve, reject) => {
        logout(state.access_token, state.refresh_token).then(() => {
          // 清除菜单
          commit('SET_MENU', [])
          // 清除权限
          commit('SET_PERMISSIONS', [])
          // 清除用户信息
          commit('SET_USER_INFO', {})
          commit('SET_ACCESS_TOKEN', '')
          commit('SET_REFRESH_TOKEN', '')
          commit('SET_ROLES', [])
          commit('DEL_ALL_TAG')
          // 清除附件配置信息
          commit('SET_SYS_CONFIG', {})
          removeToken()
          removeRefreshToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 注销session
    FedLogOut({
      commit
    }) {
      return new Promise(resolve => {
        // 清除菜单
        commit('SET_MENU', [])
        // 清除权限
        commit('SET_PERMISSIONS', [])
        // 清除用户信息
        commit('SET_USER_INFO', {})
        commit('SET_ACCESS_TOKEN', '')
        commit('SET_REFRESH_TOKEN', '')
        commit('SET_ROLES', [])
        commit('DEL_ALL_TAG')
        // 清除附件配置信息
        commit('SET_SYS_CONFIG', {})
        removeToken()
        removeRefreshToken
        resolve()
      })
    },
    // 获取系统菜单
    GetMenu({ commit }) {
      return new Promise(resolve => {
        GetMenu().then((res) => {
          const data = res.data
          data.forEach(ele => {
            ele.children.forEach(child => {
              if (!validatenull(child.component)) child.path = `${ele.path}/${child.path}`
            })
          })
          commit('SET_MENU', data)
          resolve(data)
        })
      })
    }
  },
  mutations: {
    SET_ACCESS_TOKEN: (state, access_token) => {
      state.access_token = access_token
      setStore({
        name: 'access_token',
        content: state.access_token,
        type: 'session'
      })
    },
    SET_MENU: (state, menu) => {
      state.menu = menu
      setStore({
        name: 'menu',
        content: state.menu,
        type: 'session'
      })
    },
    SET_USER_INFO: (state, userInfo) => {
      state.userInfo = userInfo
      setStore({
        name: 'userInfo',
        content: state.userInfo,
        type: 'session'
      })
    },
    SET_REFRESH_TOKEN: (state, rfToken) => {
      state.refresh_token = rfToken
      setStore({
        name: 'refresh_token',
        content: state.refresh_token,
        type: 'session'
      })
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
      setStore({
        name: 'roles',
        content: state.roles,
        type: 'session'
      })
    },
    SET_PERMISSIONS: (state, permissions) => {
      const list = {}
      for (let i = 0; i < permissions.length; i++) {
        list[permissions[i]] = true
      }
      state.permissions = list
      setStore({
        name: 'permissions',
        content: state.permissions,
        type: 'session'
      })
    }
  }
}
export default user
