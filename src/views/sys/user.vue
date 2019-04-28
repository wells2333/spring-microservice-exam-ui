<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('table.username')" v-model="listQuery.username" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button v-if="user_btn_add" class="filter-item" icon="el-icon-check" plain @click="handleCreate">{{ $t('table.add') }}</el-button>
      <el-button v-if="user_btn_del" class="filter-item" icon="el-icon-delete" plain @click="handleDeletes">{{ $t('table.del') }}</el-button>
      <el-button v-if="user_btn_import" class="filter-item" icon="el-icon-upload2" plain @click="handleImport">{{ $t('table.import') }}</el-button>
      <el-button v-if="user_btn_export" class="filter-item" icon="el-icon-download" plain @click="handleExport">{{ $t('table.export') }}</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      ref="multipleTable"
      :key="tableKey"
      :data="list"
      border
      highlight-current-row
      style="width: 100%;"
      @cell-dblclick="handleUpdate"
      @selection-change="handleSelectionChange"
      @sort-change="sortChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column :label="$t('table.username')" sortable prop="username" min-width="110">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.name')" sortable prop="name" min-width="110">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.ownDept')" width="210px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.deptName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.role')" width="210px" align="center">
        <template slot-scope="scope">
          <span v-for="role in scope.row.roleList" :key="role.id">{{ role.roleName }} </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" sortable prop="status" align="center" width="95px">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusTypeFilter">{{ scope.row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" class-name="status-col" width="300px">
        <template slot-scope="scope">
          <el-button v-if="user_btn_edit" type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button v-if="user_btn_del" size="mini" type="danger" @click="handleDelete(scope.row)">{{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination v-show="total>0" :current-page="listQuery.pageNum" :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="60%" top="10vh">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="100px" style="width: 90%;">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('table.username')" prop="username">
              <el-input v-model="temp.username" :readonly="temp.readonly" placeholder="账号"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('table.name')" prop="name">
              <el-input v-model="temp.name" placeholder="姓名"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('table.ownDept')" prop="deptName">
              <el-input v-model="temp.deptName" placeholder="请选择所属部门" @focus="handleSelectDept"/>
              <input v-model="temp.deptId" type="hidden">
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('table.role')" prop="role">
              <el-select v-model="temp.role" class="filter-item" placeholder="请选择角色" multiple width="100%">
                <el-option v-for="item in roleData" :key="item.id" :label="item.roleName" :value="item.id">
                  <span style="float: left">{{ item.roleName }}</span>
                </el-option>
              </el-select>
              <input v-model="temp.roleId" type="hidden">
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('table.phone')" prop="phone">
              <el-input v-model="temp.phone" placeholder="电话号码"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('table.born')" prop="born">
              <el-date-picker v-model="temp.born" type="date" format="yyyy 年 MM 月 dd 日" value-format="yyyy-MM-dd" placeholder="出生日期"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('table.sex')">
              <el-radio-group v-model="temp.sex">
                <el-radio :label="0">男</el-radio>
                <el-radio :label="1">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('table.status')">
              <el-radio-group v-model="temp.status">
                <el-radio :label="0">启用</el-radio>
                <el-radio :label="1">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('table.remark')">
              <el-input :autosize="{ minRows: 4, maxRows: 6}" v-model="temp.remark" type="textarea" placeholder="备注"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogDeptVisible">
      <el-row>
        <el-col :span="5" style ="margin-top:10px;">
          <el-tree
            :data="treeDeptData"
            :default-expanded-keys="aExpandedKeys"
            :filter-node-method="filterNode"
            :props="defaultDeptProps"
            :unique-opened="true"
            class="filter-tree"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="getDeptNodeData"
            @node-expand="nodeExpand"
            @node-collapse="nodeCollapse"
          />
        </el-col>
      </el-row>
    </el-dialog>

    <!-- 导入用户 -->
    <el-dialog :visible.sync="dialogImportVisible" :title="$t('table.import')">
      <el-row>
        <el-col :span="24">
          <el-upload
            drag
            :show-file-list="false"
            :on-success="handleUploadUserSuccess"
            :before-upload="beforeUploadUserUpload"
            :on-progress="handleUploadProgress"
            :action="importUrl"
            :headers="headers"
            style="text-align: center;">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div slot="tip" class="el-upload__tip">只能上传xlsx文件</div>
          </el-upload>
        </el-col>
      </el-row>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, addObj, putObj, delObj, delAllObj, exportObj } from '@/api/admin/user'
import waves from '@/directive/waves'
import { fetchTree } from '@/api/admin/dept'
import { deptRoleList } from '@/api/admin/role'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { checkMultipleSelect, exportExcel, isNotEmpty, notifySuccess, messageSuccess } from '@/utils/util'

export default {
  name: 'User',
  directives: {
    waves
  },
  filters: {
    statusTypeFilter(status) {
      const statusMap = {
        0: 'success',
        1: 'danger'
      }
      return statusMap[status]
    },
    statusFilter(status) {
      return status === '0' ? '启用' : '禁用'
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      multipleSelection: [],
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        username: undefined,
        sort: 'create_date',
        order: 'descending'
      },
      temp: {
        id: '',
        username: 1,
        name: '',
        phone: '',
        email: '',
        born: '',
        sex: 0,
        status: 0,
        deptId: null,
        roleId: null,
        roleList: []
      },
      dialogFormVisible: false,
      dialogDeptVisible: false,
      dialogRoleVisible: false,
      dialogImportVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新建'
      },
      pvData: [],
      rules: {
        name: [{ required: true, message: '请输入账号', trigger: 'change' }],
        username: [{ required: true, message: '请输入姓名', trigger: 'change' }]
      },
      downloadLoading: false,
      treeDeptData: [],
      roleData: [],
      role: [],
      defaultDeptProps: {
        children: 'children',
        label: 'deptName'
      },
      aExpandedKeys: [],
      user_btn_add: false,
      user_btn_edit: false,
      user_btn_del: false,
      user_btn_import: false,
      user_btn_export: false,
      importUrl: '/api/user/v1/user/import',
      headers: {
        Authorization: 'Bearer ' + getToken()
      },
      uploading: false,
      percentage: 0
    }
  },
  created() {
    this.getList()
    this.user_btn_add = this.permissions['sys:user:add']
    this.user_btn_edit = this.permissions['sys:user:edit']
    this.user_btn_del = this.permissions['sys:user:del']
    this.user_btn_import = this.permissions['sys:user:import']
    this.user_btn_export = this.permissions['sys:user:export']
  },
  computed: {
    ...mapGetters([
      'elements',
      'permissions'
    ])
  },
  methods: {
    nodeCollapse(data) {
      this.oExpandedKey[data.id] = false
      // 如果有子节点
      this.treeRecursion(this.oTreeNodeChildren[data.id], (oNode) => {
        this.oExpandedKey[oNode.id] = false
      })
      this.setExpandedKeys()
    },
    setExpandedKeys() {
      const oTemp = this.oExpandedKey
      this.aExpandedKeys = []
      for (const sKey in oTemp) {
        if (oTemp[sKey]) {
          this.aExpandedKeys.push(parseInt(sKey))
        }
      }
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    nodeExpand(data) {
      const aChildren = data.children
      if (aChildren.length > 0) {
        this.oExpandedKey[data.id] = true
        this.oTreeNodeChildren[data.id] = aChildren
      }
      this.setExpandedKeys()
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        setTimeout(() => {
          this.listLoading = false
        }, 100)
      })
    },
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
    handleModifyStatus(row, status) {
      row.status = status
      putObj(row).then(() => {
        this.dialogFormVisible = false
        messageSuccess(this, '操作成功')
      })
    },
    resetTemp() {
      this.temp = {
        id: '',
        username: '',
        sex: 0,
        remark: '',
        born: '',
        status: 0,
        readonly: false,
        deptId: null,
        roleId: null,
        roleData: [],
        role: []
      }
    },
    handleCreate() {
      this.role = []
      this.roleData = []
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addObj(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.getList()
            notifySuccess(this, '创建成功')
          })
        }
      })
    },
    handleUpdate(row) {
      row.role = []
      this.temp = Object.assign({}, row) // copy obj
      this.temp.sex = parseInt(this.temp.sex)
      this.temp.status = parseInt(this.temp.status)
      this.temp.readonly = true
      this.dialogStatus = 'update'
      this.role = []
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // 根据部门ID获取角色
      if (isNotEmpty(row.deptId)) {
        deptRoleList(row.deptId).then(response => {
          if (isNotEmpty(row.roleList)) {
            for (let i = 0; i < row.roleList.length; i++) {
              this.role[i] = row.roleList[i].id
            }
          }
          this.temp.role = this.role
          this.roleData = response.data
        })
      }
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          putObj(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.getList()
            notifySuccess(this, '更新成功')
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delObj(row.id).then(() => {
          this.dialogFormVisible = false
          notifySuccess(this, '删除成功')
        })
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
      }).catch(() => {})
    },
    // 批量删除
    handleDeletes() {
      if (checkMultipleSelect(this.multipleSelection, this)) {
        let ids = ''
        for (let i = 0; i < this.multipleSelection.length; i++) {
          ids += this.multipleSelection[i].id + ','
        }
        this.$confirm('确定要删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delAllObj({ idString: ids }).then(() => {
            this.dialogFormVisible = false
            this.getList()
            notifySuccess(this, '删除成功')
          })
        }).catch(() => {})
      }
    },
    // 导出
    handleExport() {
      if (this.multipleSelection.length === 0) {
        this.$confirm('确定要导出全部用户数据吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          exportObj({ idString: '' }).then(response => {
            // 导出Excel
            exportExcel(response)
          })
        }).catch(() => {})
      } else {
        let ids = ''
        for (let i = 0; i < this.multipleSelection.length; i++) {
          ids += this.multipleSelection[i].id + ','
        }
        exportObj({ idString: ids }).then(response => {
          // 导出Excel
          exportExcel(response)
        })
      }
    },
    // 导入
    handleImport() {
      this.dialogImportVisible = true
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    sortChange(column, prop, order) {
      this.listQuery.sort = column.prop
      this.listQuery.order = column.order
      this.getList()
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        return v[j]
      }))
    },
    handleSelectDept() {
      fetchTree().then(response => {
        this.treeDeptData = response.data
        this.dialogDeptVisible = true
        this.role = ''
        if (isNotEmpty(this.treeDeptData.id)) {
          deptRoleList(this.treeDeptData.id).then(response => {
            this.roleData = response.data
          })
        }
      })
    },
    getDeptNodeData(data) {
      this.dialogDeptVisible = false
      this.temp.deptId = data.id
      this.temp.deptName = data.deptName
      deptRoleList(data.id).then(response => {
        this.roleData = response.data
      })
    },
    // 上传前
    beforeUploadUserUpload(file) {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isExcel) {
        this.$message.error('上传附件只能是 excel 格式!')
      }
      if (!isLt10M) {
        this.$message.error('上传附件大小不能超过 10MB!')
      }
      return isExcel && isLt10M
    },
    handleUploadProgress(event, file, fileList) {
      this.uploading = true
      this.percentage = parseInt(file.percentage.toFixed(0))
    },
    // 上传成功
    handleUploadUserSuccess() {
      console.log('upload success.')
      this.dialogImportVisible = false
      this.uploading = false
      this.getList()
      notifySuccess(this, '导入成功')
    }
  }
}
</script>
