<template>
  <div class="dashboard-container">
    <component :is="currentRole"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import adminDashboard from './admin'
import userDashboard from './editor'

export default {
  name: 'Dashboard',
  components: { adminDashboard, userDashboard },
  data () {
    return {
      currentRole: 'adminDashboard'
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  created () {
    if (!this.roles.includes('role_admin')) {
      this.currentRole = 'userDashboard'
    }
  }
}
</script>
