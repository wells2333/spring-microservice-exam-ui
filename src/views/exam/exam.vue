<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('table.examinationName')" v-model="listQuery.examinationName" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.courseId" :placeholder="$t('table.course')" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in course.list" :key="item.id" :label="item.courseName" :value="item.id"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button v-if="exam_btn_add" class="filter-item" style="margin-left: 10px;" icon="el-icon-check" plain @click="handleCreate">{{ $t('table.add') }}</el-button>
      <el-button v-if="exam_btn_del" class="filter-item" icon="el-icon-delete" plain @click="handleDeletes">{{ $t('table.del') }}</el-button>
    </div>

    <!--考试列表-->
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      :default-sort="{ prop: 'id', order: 'descending' }"
      border
      highlight-current-row
      style="width: 100%;"
      @cell-dblclick="handleUpdate"
      @selection-change="handleSelectionChange"
      @sort-change="sortChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column :label="$t('table.examinationName')" sortable prop="examination_name" min-width="90" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.examinationName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.type')" sortable prop="type" min-width="90" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.type | typeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.course')" min-width="90" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.course.courseName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.startTime')" sortable prop="start_time" min-width="90" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.startTime }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.endTime')" sortable prop="end_time" min-width="90" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.endTime }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.totalSubject')" sortable prop="total_subject" align="center" width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.totalSubject }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.totalScore')" sortable prop="total_score" align="center" width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.totalScore }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" sortable prop="status" align="center" width="120px">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusTypeFilter">{{ scope.row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" class-name="status-col" width="400px">
        <template slot-scope="scope">
          <el-button v-if="exam_btn_edit" type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button v-if="exam_btn_edit && scope.row.status == 1" type="warning" size="mini" @click="handlePublic(scope.row, 0)">{{ $t('table.public') }}</el-button>
          <el-button v-if="exam_btn_edit&& scope.row.status == 0" type="success" size="mini" @click="handlePublic(scope.row, 1)">{{ $t('table.retrieve') }}</el-button>
          <el-button v-if="exam_btn_subject" size="mini" @click="handleSubjectManagement(scope.row)">{{ $t('table.subjectManagement') }}</el-button>
          <el-button v-if="exam_btn_del" size="mini" type="danger" @click="handleDelete(scope.row)">{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination v-show="total>0" :current-page="listQuery.pageNum" :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>

    <!--考试信息表单-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="70%" top="10vh">
      <el-form ref="dataForm" :rules="rules" :model="temp" :label-position="labelPosition" label-width="100px">
        <el-row>
          <el-col :span="18">
            <el-row>
              <el-col :span="24">
                <el-form-item :label="$t('table.examinationName')" prop="examinationName">
                  <el-input v-model="temp.examinationName" :readonly="temp.readonly"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item :label="$t('table.totalScore')" prop="totalScore">
                  <el-input v-model="temp.totalScore"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('table.college')" prop="collegeId">
                  <el-input v-model="temp.collegeId"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item :label="$t('table.major')" prop="majorId">
                  <el-input v-model="temp.majorId"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('table.course')" prop="course.id">
                  <el-input v-model="temp.course.courseName" @focus="selectCourse"/>
                  <input v-model="temp.course.id" type="hidden">
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item :label="$t('table.startTime')" prop="startTime">
                  <el-date-picker v-model="temp.startTime" :placeholder="$t('table.startTime')" type="datetime" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('table.endTime')" prop="endTime">
                  <el-date-picker v-model="temp.endTime" :placeholder="$t('table.endTime')" type="datetime" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item :label="$t('table.type')" prop="type">
                  <el-radio-group v-model="temp.type">
                    <el-radio :label="0">正式考试</el-radio>
                    <el-radio :label="1">模拟考试</el-radio>
                    <el-radio :label="2">在线练习</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('table.status')">
                  <el-radio-group v-model="temp.status">
                    <el-radio :label="0">已发布</el-radio>
                    <el-radio :label="1">未发布</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item :label="$t('table.attention')">
                  <el-input :autosize="{ minRows: 3, maxRows: 5}" :placeholder="$t('table.attention')" v-model="temp.attention" type="textarea"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item :label="$t('table.remark')">
                  <el-input :autosize="{ minRows: 3, maxRows: 5}" v-model="temp.remark" type="textarea" placeholder="备注"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="5" :offset="1">
            <el-upload
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :action="sysConfig.uploadUrl"
              :headers="headers"
              :data="params"
              class="avatar-uploader">
              <img v-if="temp.avatar" :src="getExaminationAvatar(temp.avatar)" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"/>
            </el-upload>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus === 'create'" type="primary" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>

    <!--课程选择弹窗-->
    <el-dialog :visible.sync="dialogCourseVisible" :title="$t('table.course')">
      <el-table v-loading="course.listLoading" :data="course.list" @row-dblclick="selectedCourse">
        <el-table-column :label="$t('table.courseName')" property="courseName" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.courseName }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.college')" property="college" width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.college }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.major')" property="major">
          <template slot-scope="scope">
            <span>{{ scope.row.major }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.teacher')" property="teacher">'
          <template slot-scope="scope">
            <span>{{ scope.row.teacher }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!--题目管理列表-->
    <el-dialog :visible.sync="dialogSubjectVisible" :title="$t('table.subjectManagement')" width="80%" top="10vh">
      <div class="filter-container">
        <el-input :placeholder="$t('table.subjectName')" v-model="subject.listQuery.subjectName" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilterSubject"/>
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilterSubject">{{ $t('table.search') }}</el-button>
        <el-button v-if="exam_btn_subject_add" class="filter-item" icon="el-icon-check" plain @click="handleCreateSubject">{{ $t('table.add') }}</el-button>
        <el-button v-if="exam_btn_subject_add" class="filter-item" icon="el-icon-check" plain @click="handleCreateSubjectFromSubjectBank">{{ $t('table.addFromSubjectBank') }}</el-button>
        <el-button v-if="exam_btn_subject_del" class="filter-item" icon="el-icon-delete" plain @click="handleDeletesSubject">{{ $t('table.del') }}</el-button>
        <el-button v-if="exam_btn_subject_import" class="filter-item" icon="el-icon-upload2" plain @click="handleImportSubject">{{ $t('table.import') }}</el-button>
        <el-button v-if="exam_btn_subject_export" class="filter-item" icon="el-icon-download" plain @click="handleExportSubject">{{ $t('table.export') }}</el-button>
      </div>
      <el-table
        v-loading="subject.listLoading"
        :data="subject.list"
        border
        highlight-current-row
        style="width: 100%;"
        @selection-change="handleSubjectSelectionChange"
        @cell-dblclick="handleUpdateSubject"
        @sort-change="sortSubjectChange">
        <el-table-column type="selection" width="55"/>
        <el-table-column :label="$t('table.subject.serialNumber')" sortable prop="serial_number" property="serialNumber" min-width="20">
          <template slot-scope="scope">
            <span>{{ scope.row.serialNumber }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.subjectName')" sortable prop="subject_name" property="subjectName" min-width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.subjectName | subjectNameFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.subject.type')" sortable prop="type" property="type" width="120">
          <template slot-scope="scope">
            <el-tag type="success">{{ scope.row.type | subjectTypeFilter }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.subject.score')" sortable prop="score" property="score" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.subject.level')" sortable prop="level" property="level" width="120">
          <template slot-scope="scope">
            <el-rate v-model="scope.row.level" :max="4"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.actions')" class-name="status-col" width="300px">
          <template slot-scope="scope">
            <el-button v-if="exam_btn_subject" type="primary" size="mini" @click="handleUpdateSubject(scope.row)">{{ $t('table.edit') }}</el-button>
            <el-button v-if="exam_btn_subject" size="mini" type="danger" @click="handleDeleteSubject(scope.row)">{{ $t('table.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination v-show="subject.total>0" :current-page="subject.listQuery.pageNum" :page-sizes="[10,20,30, 50]" :page-size="subject.listQuery.pageSize" :total="subject.total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSubjectSizeChange" @current-change="handleSubjectCurrentChange"/>
      </div>
    </el-dialog>

    <!--题目信息表单-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogSubjectFormVisible" width="80%" top="10vh">
      <el-form ref="dataSubjectForm" :rules="subjectRules" :model="tempSubject" :label-position="labelPosition" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('table.subjectName')" prop="subjectName">
              <el-input :autosize="{ minRows: 2, maxRows: 6}" v-model="tempSubject.subjectName" type="textarea"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('table.subject.type')" prop="type">
              <el-select v-model="tempSubject.type" class="filter-item" placeholder="请选择题目类型" width="100%" @change="changeSubjectType">
                <el-option v-for="item in subjectTypeData" :key="item.id" :label="item.subjectTypeName" :value="item.id">
                  <span style="float: left">{{ item.subjectTypeName }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('table.subject.serialNumber')" prop="serialNumber">
              <el-input v-model="tempSubject.serialNumber"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('table.subject.level')" prop="level">
              <el-rate v-model="tempSubject.level" :max="4" :texts="['简单', '一般', '略难', '非常难']" show-text/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('table.subject.score')" prop="score">
              <el-input v-model="tempSubject.score"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="tempSubject.type !== 0">
          <el-col :span="24">
            <el-form-item :label="$t('table.subject.content')" prop="content">
              <el-input :autosize="{ minRows: 2, maxRows: 6}" v-model="tempSubject.content" type="textarea"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="tempSubject.type === 0">
          <el-col :span="24">
            <el-form-item :label="$t('table.subject.optionA')" prop="optionA">
              <el-input :autosize="{ minRows: 2, maxRows: 6}" v-model="tempSubject.optionA" type="textarea"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="tempSubject.type === 0">
          <el-col :span="24">
            <el-form-item :label="$t('table.subject.optionB')" prop="optionB">
              <el-input :autosize="{ minRows: 2, maxRows: 6}" v-model="tempSubject.optionB" type="textarea"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="tempSubject.type === 0">
          <el-col :span="24">
            <el-form-item :label="$t('table.subject.optionC')" prop="optionC">
              <el-input :autosize="{ minRows: 2, maxRows: 6}" v-model="tempSubject.optionC" type="textarea"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="tempSubject.type === 0">
          <el-col :span="24">
            <el-form-item :label="$t('table.subject.optionD')" prop="optionD">
              <el-input :autosize="{ minRows: 2, maxRows: 6}" v-model="tempSubject.optionD" type="textarea"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('table.subject.answer')" prop="answer">
              <!-- 非选择 -->
              <el-input v-if="tempSubject.type !== 0" :autosize="{ minRows: 2, maxRows: 6}" v-model="tempSubject.answer" type="textarea"/>
              <!-- 选择题 -->
              <el-radio-group v-if="tempSubject.type === 0" v-model="tempSubject.answer">
                <el-radio :label="'A'">A</el-radio>
                <el-radio :label="'B'">B</el-radio>
                <el-radio :label="'C'">C</el-radio>
                <el-radio :label="'D'">D</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('table.subject.analysis')" prop="analysis">
              <el-input :autosize="{ minRows: 2, maxRows: 6}" v-model="tempSubject.analysis" type="textarea"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSubjectFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus === 'create'" type="primary" @click="createSubjectData">{{ $t('table.save') }}</el-button>
        <el-button v-else type="primary" @click="updateSubjectData">{{ $t('table.save') }}</el-button>
        <el-button type="primary" @click="updateAndAddSubjectData">{{ $t('table.saveAndAdd') }}</el-button>
      </div>
    </el-dialog>

    <!-- 导入题目 -->
    <el-dialog :visible.sync="dialogImportVisible" :title="$t('table.import')">
      <el-row>
        <el-col :span="24">
          <el-upload
            drag
            :multiple="false"
            :auto-upload="true"
            :show-file-list="true"
            :before-upload="beforeUploadSubjectUpload"
            :on-progress="handleUploadSubjectProgress"
            :on-success="handleUploadSubjectSuccess"
            :action="importUrl"
            :headers="headers"
            :data="params"
            style="text-align: center;">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div slot="tip" class="el-upload__tip">只能上传xlsx文件</div>
          </el-upload>
        </el-col>
      </el-row>
    </el-dialog>

    <!-- 题库列表 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="category.dialogVisible" width="80%" top="10vh">
      <el-row>
        <el-col :span="4">
          <el-card class="tree-box-card" style="margin-right: 5px;">
            <div slot="header">
              <span>题目分类</span>
            </div>
            <el-row>
              <div class="tree-container">
                <el-tree
                  :data="category.treeData"
                  :props="category.defaultProps"
                  class="filter-tree"
                  node-key="id"
                  highlight-current
                  accordion
                  default-expand-all
                  @node-click="getNodeData"
                />
              </div>
            </el-row>
          </el-card>
        </el-col>

        <el-col :span="20">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>选择题目</span>
            </div>
            <el-table
              v-loading="category.listLoading"
              :data="category.list"
              :default-sort="{ prop: 'id', order: 'ascending' }"
              border
              highlight-current-row
              style="width: 100%;"
              @row-click = "handleSingleSubjectSelection"
              @current-change="handleSingleSubjectCurrentChange">
              <el-table-column align="center" width="55" label="" >
                <template slot-scope="scope">
                  <el-radio :label="scope.$index" v-model="category.tempRadio" @change.native="handleSingleSubjectSelectionChange(scope.$index, scope.row)">&nbsp;</el-radio>
                </template>
              </el-table-column>
              <el-table-column :label="$t('table.subjectName')" sortable prop="subject_name" property="subjectName" min-width="120">
                <template slot-scope="scope">
                  <span>{{ scope.row.subjectName }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('table.subject.type')" sortable prop="type" property="type" width="200">
                <template slot-scope="scope">
                  <el-tag type="success">{{ scope.row.type | subjectTypeFilter }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="$t('table.subject.score')" sortable prop="score" property="score">
                <template slot-scope="scope">
                  <span>{{ scope.row.score }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('table.subject.level')" sortable prop="level" property="level">'
                <template slot-scope="scope">
                  <el-rate v-model="scope.row.level" :max="4"/>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-container">
              <el-pagination v-show="category.total>0" :current-page="category.listQuery.pageNum" :page-sizes="[10,20,30, 50]" :page-size="category.listQuery.pageSize" :total="category.total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="category.dialogVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="handleSelectSubject">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>

    <!-- 富文本编辑 -->
    <el-dialog :visible.sync="tinymce.dialogTinymceVisible" :title="$t('table.edit')">
      <tinymce ref="editor" :height="300" v-model="tinymce.tempValue" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="tinymce.dialogTinymceVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="updateTinymceData">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, addObj, putObj, delObj, delAllObj } from '@/api/exam/exam'
import { fetchCourseList } from '@/api/exam/course'
import { fetchSubjectList, addSubject, putSubject, delSubject, delAllSubject, exportSubject } from '@/api/exam/subject'
import { fetchSubjectBankList } from '@/api/exam/subjectBank'
import { fetchTree } from '@/api/exam/subjectCategory'
import waves from '@/directive/waves'
import { mapGetters, mapState } from 'vuex'
import { getToken } from '@/utils/auth'
import { checkMultipleSelect, exportExcel, getAttachmentPreviewUrl, isNotEmpty, notifySuccess, notifyFail, messageSuccess } from '@/utils/util'
import { delAttachment } from '@/api/admin/attachment'
import Tinymce from '@/components/Tinymce'

export default {
  name: 'ExamManagement',
  directives: {
    waves
  },
  components: { Tinymce },
  filters: {
    statusTypeFilter(status) {
      const statusMap = {
        0: 'success',
        1: 'warning'
      }
      return statusMap[status]
    },
    statusFilter(status) {
      return status === '0' ? '已发布' : '未发布'
    },
    typeFilter(type) {
      const typeMap = {
        0: '正式考试',
        1: '模拟考试',
        2: '在线练习'
      }
      return typeMap[type]
    },
    subjectTypeFilter(type) {
      const typeMap = {
        0: '选择题',
        1: '填空题',
        2: '判断题',
        3: '简答题'
      }
      return typeMap[type]
    },
    subjectNameFilter(subjectName) {
      if (subjectName.length > 50) {
        return subjectName.substring(0, 50) + '...'
      }
      return subjectName
    }
  },
  data() {
    return {
      headers: {
        Authorization: 'Bearer ' + getToken()
      },
      params: {
        busiType: '1'
      },
      baseUrl: '/exam',
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        courseId: '',
        sort: 'create_date',
        order: 'descending'
      },
      // 课程
      course: {
        listQuery: {
          pageNum: 1,
          pageSize: 10,
          sort: 'create_date',
          order: 'descending'
        },
        list: null,
        total: null,
        listLoading: true
      },
      // 题目
      subject: {
        listQuery: {
          pageNum: 1,
          pageSize: 10,
          examinationId: '',
          categoryId: '',
          sort: 'serial_number',
          order: 'ascending'
        },
        list: null,
        total: null,
        listLoading: true,
        examinationId: '',
        categoryId: ''
      },
      // 考试临时信息
      temp: {
        id: '',
        examinationName: '',
        type: 0,
        attention: '',
        startTime: '',
        endTime: '',
        duration: '',
        totalScore: '',
        totalSubject: '0',
        status: 0,
        avatar: '',
        avatarId: '',
        collegeId: '',
        majorId: '',
        course: {
          id: '',
          courseName: ''
        },
        remark: ''
      },
      // 题目临时信息
      tempSubject: {
        id: '',
        serialNumber: '',
        examinationId: '',
        categoryId: '',
        subjectName: '',
        type: 0,
        content: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        optionE: '',
        optionF: '',
        answer: '',
        score: '',
        analysis: '',
        level: 2
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新建'
      },
      // 校验规则
      rules: {
        examinationName: [{ required: true, message: '请输入考试名称', trigger: 'change' }],
        collegeId: [{ required: true, message: '请输入考试所属学院', trigger: 'change' }],
        majorId: [{ required: true, message: '请输入考试所属专业', trigger: 'change' }],
        courseId: [{ required: true, message: '请输入考试所属课程', trigger: 'change' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
        totalScore: [{ required: true, message: '请输入总分', trigger: 'change' }]
      },
      // 表单校验规则
      subjectRules: {
        subjectName: [{ required: true, message: '请输入题目名称', trigger: 'change' }],
        score: [{ required: true, message: '请输入题目分值', trigger: 'change' }],
        content: [{ required: true, message: '请输入题目内容', trigger: 'change' }],
        optionA: [{ required: true, message: '请输入选项A', trigger: 'change' }],
        optionB: [{ required: true, message: '请输入选项B', trigger: 'change' }],
        optionC: [{ required: true, message: '请输入选项C', trigger: 'change' }],
        optionD: [{ required: true, message: '请输入选项D', trigger: 'change' }],
        answer: [{ required: true, message: '请输入答案', trigger: 'change' }]
      },
      downloadLoading: false,
      labelPosition: 'right',
      // 按钮权限
      exam_btn_add: false,
      exam_btn_edit: false,
      exam_btn_del: false,
      exam_btn_subject: false,
      exam_btn_subject_import: false,
      exam_btn_subject_export: false,
      dialogCourseVisible: false,
      courseData: [],
      dialogSubjectVisible: false,
      subjectData: [],
      dialogSubjectFormVisible: false,
      // 题目类型
      subjectTypeData: [
        { id: 0, subjectTypeName: '选择题' },
        { id: 3, subjectTypeName: '简答题' }
      ],
      // 多选考试
      multipleSelection: [],
      // 多选题目
      multipleSubjectSelection: [],
      // 单选题目
      singleSubjectSelection: [],
      // 导入弹窗状态
      dialogImportVisible: false,
      // 导入题目的url
      importUrl: '/api/exam/v1/subject/import',
      headers: {
        Authorization: 'Bearer ' + getToken()
      },
      params: {
        examinationId: ''
      },
      uploading: false,
      percentage: 0,
      uploadingSubject: false,
      percentageSubject: 0,
      // 题目分类数据
      category: {
        dialogVisible: false,
        // 题目列表查询参数
        listQuery: {
          subjectName: undefined,
          categoryId: undefined,
          sort: 'serial_number',
          order: 'ascending'
        },
        // 题目列表数据
        list: [],
        // 分类树数据
        treeData: [],
        // 题目分类数据
        defaultProps: {
          children: 'children',
          label: 'categoryName'
        },
        // 列表加载状态
        listLoading: false,
        tempRadio: ''
      },
      tinymce: {
        dialogTinymceVisible: false,
        tempValue: ''
      }
    }
  },
  created() {
    // 加载考试列表
    this.getList()
    // 获取课程列表
    fetchCourseList(this.course.listQuery).then(response => {
      this.course.list = [{ id: '', courseName: '请选择' }].concat(response.data.list)
      this.course.total = response.data.total
      this.course.listLoading = false
    })
    this.exam_btn_add = this.permissions['exam:exam:add']
    this.exam_btn_edit = this.permissions['exam:exam:edit']
    this.exam_btn_del = this.permissions['exam:exam:del']
    this.exam_btn_subject = this.permissions['exam:exam:subject']
    this.exam_btn_subject_add = this.permissions['exam:exam:subject:add']
    this.exam_btn_subject_del = this.permissions['exam:exam:subject:del']
    this.exam_btn_subject_import = this.permissions['exam:exam:subject:import']
    this.exam_btn_subject_export = this.permissions['exam:exam:subject:export']
  },
  computed: {
    ...mapGetters([
      'elements',
      'permissions'
    ]),
    ...mapState({
      sysConfig: state => state.sysConfig.sysConfig
    })
  },
  methods: {
    // 加载考试列表
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 500)
      })
    },
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
    handleSubjectSizeChange(val) {
      this.subject.listQuery.limit = val
      this.handleSubjectManagement()
    },
    handleSubjectCurrentChange(val) {
      this.subject.listQuery.pageNum = val
      this.handleSubjectManagement()
    },
    handleModifyStatus(row, status) {
      row.status = status
      putObj(row).then(() => {
        this.dialogFormVisible = false
        messageSuccess(this, '操作成功')
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleSubjectSelectionChange(val) {
      this.multipleSubjectSelection = val
    },
    // 题库里选择题目
    handleSingleSubjectSelectionChange(index, row) {
      this.category.singleSubjectSelection = row
    },
    // 点击行时选择题目
    handleSingleSubjectSelection(row) {
      this.category.tempRadio = this.category.list.indexOf(row)
    },
    // 表格变化
    handleSingleSubjectCurrentChange(row) {
      this.category.singleSubjectSelection = row
    },
    // 选择题目
    handleSelectSubject() {
      // 隐藏弹框
      this.category.dialogVisible = false
      // 赋值给临时题目
      this.tempSubject = this.category.singleSubjectSelection
      // 清空题目ID
      this.tempSubject.id = ''
      // 清空分类ID
      this.tempSubject.categoryId = ''
      // 绑定考试ID
      this.tempSubject.examinationId = this.subject.examinationId
      // 状态为新建
      this.dialogStatus = 'create'
      // 显示题目信息表单
      this.dialogSubjectFormVisible = true
    },
    // 排序事件
    sortChange(column, prop, order) {
      this.listQuery.sort = column.prop
      this.listQuery.order = column.order
      this.getList()
    },
    sortSubjectChange(column, prop, order) {
      this.subject.listQuery.sort = column.prop
      this.subject.listQuery.order = column.order
      this.handleSubjectManagement()
    },
    // 点击分类
    getNodeData(data) {
      // 获取分类ID
      this.category.listQuery.categoryId = data.id
      // 获取题目信息
      this.handleSubjectBankManagement()
    },
    resetTemp() {
      this.temp = {
        id: '',
        examinationName: '',
        type: 0,
        attention: '',
        startTime: '',
        endTime: '',
        duration: '',
        totalScore: '',
        status: 0,
        avatar: '',
        collegeId: '',
        majorId: '',
        course: {
          id: '',
          courseName: ''
        },
        remark: ''
      }
    },
    handleCreate() {
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
      this.temp = Object.assign({}, row) // copy obj
      this.temp.status = parseInt(this.temp.status)
      this.temp.type = parseInt(this.temp.type)
      if (!isNotEmpty(this.temp.course)) {
        this.temp.course = {
          id: '',
          courseName: ''
        }
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
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
    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delObj(row.id).then(() => {
          this.dialogFormVisible = false
          this.getList()
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
            this.getList()
            notifySuccess(this, '删除成功')
          })
        }).catch(() => {})
      }
    },
    // 选择课程
    selectCourse() {
      this.course.listLoading = true
      fetchCourseList(this.course.listQuery).then(response => {
        this.course.list = response.data.list
        this.course.total = response.data.total
        this.course.listLoading = false
      })
      this.dialogCourseVisible = true
    },
    // 双击选择课程
    selectedCourse(row) {
      this.temp.course.id = row.id
      this.temp.course.courseName = row.courseName
      this.dialogCourseVisible = false
    },
    // 加载题目
    handleSubjectManagement(row) {
      this.subject.listLoading = true
      // 保存当前题目列表的考试ID
      if (row !== undefined) {
        this.subject.examinationId = row.id
        this.subject.listQuery.examinationId = row.id
        this.params.examinationId = row.id
      }
      fetchSubjectList(this.subject.listQuery).then(response => {
        if (response.data.list.length > 0) {
          for (let i = 0; i < response.data.list.length; i++) {
            const subject = response.data.list[i]
            subject.type = parseInt(subject.type)
            subject.level = parseInt(subject.level)
          }
        }
        this.subject.list = response.data.list
        this.subject.total = response.data.total
        this.subject.listLoading = false
      })
      this.dialogSubjectVisible = true
    },
    // 加载题库列表
    handleSubjectBankManagement() {
      this.category.listLoading = true
      fetchSubjectBankList(this.category.listQuery).then(response => {
        if (response.data.list.length > 0) {
          for (let i = 0; i < response.data.list.length; i++) {
            const subject = response.data.list[i]
            subject.type = parseInt(subject.type)
            subject.level = parseInt(subject.level)
          }
        }
        this.category.list = response.data.list
        this.category.total = response.data.total
        this.category.listLoading = false
      })
    },
    handleFilterSubject() {
      this.subject.listQuery.pageNum = 1
      this.handleSubjectManagement()
    },
    // 新建题目
    handleCreateSubject() {
      this.resetTempSubject()
      this.dialogStatus = 'create'
      this.dialogSubjectFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataSubjectForm'].clearValidate()
      })
    },
    // 从题库新增
    handleCreateSubjectFromSubjectBank() {
      // 加载分类树
      fetchTree(this.category.listQuery).then(response => {
        this.category.treeData = response.data
      })
      this.category.dialogVisible = true
      // 加载题目列表
    },
    resetTempSubject(serialNumber, score) {
      this.tempSubject = {
        id: '',
        examinationId: '',
        serialNumber: '',
        subjectName: '',
        type: 0,
        content: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        optionE: '',
        optionF: '',
        answer: '',
        score: '',
        analysis: '',
        level: 2
      }
      // 默认序号
      if (isNotEmpty(serialNumber)) {
        this.tempSubject.serialNumber = serialNumber
      }

      // 默认分数
      if (isNotEmpty(score)) {
        this.tempSubject.score = score
      }
    },
    // 修改题目
    handleUpdateSubject(row) {
      this.tempSubject = Object.assign({}, row) // copy obj
      this.tempSubject.status = parseInt(status)
      this.tempSubject.type = parseInt(row.type)
      // 绑定考试ID
      this.tempSubject.examinationId = this.subject.examinationId
      this.dialogStatus = 'update'
      this.dialogSubjectFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataSubjectForm'].clearValidate()
      })
    },
    // 删除题目
    handleDeleteSubject(row) {
      this.$confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delSubject(row.id).then(() => {
          this.dialogSubjectFormVisible = false
          this.handleSubjectManagement()
          notifySuccess(this, '删除成功')
        })
      }).catch(() => {})
    },
    // 保存题目
    createSubjectData() {
      this.$refs['dataSubjectForm'].validate((valid) => {
        if (valid) {
          // 绑定考试ID
          this.tempSubject.examinationId = this.subject.examinationId
          addSubject(this.tempSubject).then(() => {
            this.subject.list.unshift(this.tempSubject)
            this.dialogSubjectFormVisible = false
            this.handleSubjectManagement()
            notifySuccess(this, '创建成功')
          })
        }
      })
    },
    // 更新题目
    updateSubjectData() {
      this.$refs['dataSubjectForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.tempSubject)
          putSubject(tempData).then(() => {
            this.dialogSubjectFormVisible = false
            this.handleSubjectManagement()
            notifySuccess(this, '更新成功')
          })
        }
      })
    },
    // 更新并添加题目
    updateAndAddSubjectData() {
      this.$refs['dataSubjectForm'].validate((valid) => {
        if (valid) {
          // 绑定考试ID
          this.tempSubject.examinationId = this.subject.examinationId
          const tempData = Object.assign({}, this.tempSubject)
          // 创建
          if (this.dialogStatus === 'create') {
            addSubject(this.tempSubject).then(() => {
              this.resetTempSubject(parseInt(this.tempSubject.serialNumber) + 1, tempData.score)
              this.dialogStatus = 'create'
              this.$nextTick(() => {
                this.$refs['dataSubjectForm'].clearValidate()
              })
              this.handleSubjectManagement()
              notifySuccess(this, '创建成功')
            })
          } else {
            // 修改
            putSubject(tempData).then(() => {
              this.resetTempSubject(parseInt(tempData.serialNumber) + 1, tempData.score)
              this.dialogStatus = 'create'
              this.$nextTick(() => {
                this.$refs['dataSubjectForm'].clearValidate()
              })
              this.handleSubjectManagement()
              notifySuccess(this, '更新成功')
            })
          }
        }
      })
    },
    // 切换题目类型
    changeSubjectType(value) {
      console.log(value)
    },
    // 发布考试
    handlePublic(row, status) {
      const tempData = Object.assign({}, row)
      tempData.status = status
      putObj(tempData).then(() => {
        this.getList()
        notifySuccess(this, '更新成功')
      })
    },
    // 批量删除
    handleDeletesSubject() {
      if (checkMultipleSelect(this.multipleSubjectSelection, this)) {
        let ids = ''
        for (let i = 0; i < this.multipleSubjectSelection.length; i++) {
          ids += this.multipleSubjectSelection[i].id + ','
        }
        this.$confirm('确定要删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delAllSubject({ idString: ids }).then(() => {
            this.handleSubjectManagement()
            notifySuccess(this, '删除成功')
          })
        }).catch(() => {})
      }
    },
    // 导出
    handleExportSubject() {
      // 没选择题目，导出所有
      if (this.multipleSubjectSelection.length === 0) {
        this.$confirm('是否导出所有题目?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success'
        }).then(() => {
          exportSubject({ idString: '', examinationId: this.subject.examinationId }).then(response => {
            // 导出Excel
            exportExcel(response)
          })
        }).catch(() => {})
      } else {
        // 导出选中
        this.$confirm('是否导出选中的题目?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success'
        }).then(() => {
          let ids = ''
          for (let i = 0; i < this.multipleSubjectSelection.length; i++) {
            ids += this.multipleSubjectSelection[i].id + ','
          }
          exportSubject({ idString: ids, examinationId: '' }).then(response => {
            // 导出Excel
            exportExcel(response)
          })
        }).catch(() => {})
      }
    },
    // 导入
    handleImportSubject() {
      this.dialogImportVisible = true
    },
    // 上传前
    beforeUploadSubjectUpload(file) {
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
    handleUploadSubjectProgress(event, file, fileList) {
      this.uploadingSubject = true
      this.percentageSubject = parseInt(file.percentage.toFixed(0))
    },
    // 上传成功
    handleUploadSubjectSuccess() {
      this.dialogImportVisible = false
      this.handleSubjectManagement()
      notifySuccess(this, '导入成功')
      this.uploadingSubject = false
    },
    // 图片上传前
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 jpg/png 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    // 上传成功
    handleAvatarSuccess(res, file) {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (isNotEmpty(this.temp.avatar)) {
            // 删除旧头像
            delAttachment(this.temp.avatarId).then(() => {
              // 更新头像信息
              this.temp.avatarId = res.data.id
              this.temp.avatar = res.data.fastFileId
              putObj(Object.assign({}, this.temp)).then(() => {
                notifySuccess(this, '上传成功')
                this.dialogFormVisible = false
                this.getList()
              }).catch(() => {
                notifyFail(this, '上传失败')
              })
            })
          } else {
            // 更新头像信息
            this.temp.avatarId = res.data.id
            this.temp.avatar = res.data.fastFileId
            putObj(Object.assign({}, this.temp)).then(() => {
              notifySuccess(this, '上传成功')
              this.dialogFormVisible = false
              this.getList()
            }).catch(() => {
              notifyFail(this, '上传失败')
            })
          }
        }
      })
    },
    getExaminationAvatar(avatar) {
      return getAttachmentPreviewUrl(this.sysConfig, avatar)
    },
    // 输入
    handleInputTinymce(value) {
      this.tinymce.tempValue = value
      this.tinymce.dialogTinymceVisible = true
    },
    // 富文本保存
    updateTinymceData() {
      console.log(this.$refs.editor.getContent())
      this.tinymce.dialogTinymceVisible = false
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
  .editor-content{
    margin-top: 20px;
  }
</style>
