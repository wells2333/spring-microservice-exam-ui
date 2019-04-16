import { asyncRouterMap, constantRouterMap } from '@/router'
import { setStore, getStore } from '@/utils/store'
import { initMenu } from '@/utils/util'
import { GetMenu } from '@/api/admin/menu'
import router from '../../router'
import store from '../index'

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.indexOf(role) >= 0)
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(asyncRouterMap, roles) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (hasPermission(roles, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

const permission = {
  state: {
    routers: getStore({
      name: 'routers'
    }) || {},
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
      setStore({
        name: 'routers',
        content: state.routers,
        type: 'session'
      })
      router.addRoutes(state.addRouters) // 动态添加可访问路由表
    }
  },
  actions: {
    GenerateRoutes({ commit }, data) {
      let accessedRouters
      GetMenu().then(data => {
        accessedRouters = initMenu(data.data)
        commit('SET_ROUTERS', accessedRouters)
      })
    }
  }
}

export default permission
