<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" flat>
      <v-app-bar-title>心臟內科初診病人問診表9</v-app-bar-title>
      <v-spacer />
      <v-btn icon="mdi-theme-light-dark" @click="toggleTheme" />
      <v-btn icon="mdi-menu" @click="drawer = !drawer" />
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list nav>
        <v-list-item prepend-icon="mdi-home" title="首頁" />
        <v-list-item prepend-icon="mdi-form-textbox" title="表單" />
        <v-list-item prepend-icon="mdi-table" title="表格" />
      </v-list>
    </v-navigation-drawer>

    <!-- 主內容 -->
    <v-main class="pa-4">
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card elevation="2" title="基本資料與病史">
              <v-card-text>
                <v-form @submit.prevent="submitForm">
                  <!-- 姓名 -->
                  <v-text-field
                    v-model="user.name"
                    label="姓名"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                    required
                  />

                  <!-- 性別 / 年齡 -->
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-label class="mb-2 d-inline-block">性別</v-label>
                      <v-radio-group v-model="user.gender" inline>
                        <v-radio label="男" value="male" />
                        <v-radio label="女" value="female" />
                        <v-radio label="其他" value="other" />
                      </v-radio-group>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model.number="user.age"
                        label="年齡（歲）"
                        type="number"
                        step="0.1"
                        inputmode="decimal"
                        variant="outlined"
                        :rules="ageRules"
                      />
                    </v-col>
                  </v-row>

                  <!-- 身高 / 體重 / BMI -->
                  <v-row>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model.number="user.heightCm"
                        label="身高（cm）"
                        type="number"
                        step="0.1"
                        suffix="cm"
                        variant="outlined"
                        :rules="[oneDecimal, positive]"
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model.number="user.weightKg"
                        label="體重（kg）"
                        type="number"
                        step="0.1"
                        suffix="kg"
                        variant="outlined"
                        :rules="[oneDecimal, positive]"
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        :model-value="user.bmi !== null ? user.bmi.toFixed(1) : '—'"
                        label="BMI"
                        suffix="kg/m²"
                        variant="outlined"
                        readonly
                      />
                    </v-col>
                  </v-row>

                  <!-- 診間血壓 -->
                  <v-label class="mb-2 d-inline-block">診間血壓（mmHg）</v-label>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model.number="user.bpSys"
                        label="收縮壓"
                        type="number"
                        suffix="mmHg"
                        variant="outlined"
                        :rules="[intRange(60,260,'請輸入 60–260 的整數')]"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model.number="user.bpDia"
                        label="舒張壓"
                        type="number"
                        suffix="mmHg"
                        variant="outlined"
                        :rules="[intRange(30,160,'請輸入 30–160 的整數')]"
                      />
                    </v-col>
                  </v-row>

                  <!-- 主訴(主要掛號原因) -->
                  <v-card class="mt-6" variant="outlined">
                    <v-card-title class="text-h6">主訴（主要掛號原因）</v-card-title>
                    <v-card-text>
                      <template v-for="symptom in symptomGroups" :key="symptom.key">
                        <v-divider class="my-4" />
                        <v-label class="mb-2 d-inline-block">{{ symptom.label }}</v-label>
                        <v-radio-group v-model="user[symptom.key]" inline>
                          <v-radio label="無" value="none" />
                          <v-radio label="有" value="yes" />
                        </v-radio-group>

                        <v-expand-transition>
                          <div v-if="user[symptom.key] === 'yes'">

                            <!-- 胸痛：疼痛位置（在發生多久之前） -->
                            <template v-if="symptom.key === 'chestPain'">
                              <v-text-field
                                v-model="user.chestPainLocation"
                                label="疼痛位置"
                                variant="outlined"
                                placeholder="例如：胸骨後、左胸、右胸、放射到手臂等"
                                clearable
                              />
                            </template>

                            <!-- 心悸 / 暈眩 / 水腫 類型多選 -->
                            <template v-if="['palpitation','dizziness','edema'].includes(symptom.key)">
                              <v-autocomplete
                                v-if="symptom.key==='palpitation'"
                                v-model="user[`${symptom.key}Type`]"
                                :items="palpitationOptions"
                                label="心悸型態（可複選）"
                                chips multiple variant="outlined"
                              />
                              <v-autocomplete
                                v-else-if="symptom.key==='dizziness'"
                                v-model="user[`${symptom.key}Type`]"
                                :items="dizzinessOptions"
                                label="暈眩型態（可複選）"
                                chips multiple variant="outlined"
                              />
                              <v-autocomplete
                                v-else-if="symptom.key==='edema'"
                                v-model="user[`${symptom.key}Type`]"
                                :items="edemaOptions"
                                label="水腫部位（可複選）"
                                chips multiple variant="outlined"
                              />
                            </template>

                            <!-- 血壓控制不良：專屬欄位 -->
                            <template v-if="symptom.key==='hypertensionPoorControl'">
                              <v-label class="mb-2 d-inline-block">最近血壓值（mmHg）</v-label>
                              <v-row>
                                <v-col cols="12" sm="6">
                                  <v-text-field
                                    v-model.number="user.hypertensionRecentSys"
                                    label="收縮壓"
                                    type="number"
                                    suffix="mmHg"
                                    variant="outlined"
                                    :rules="[intRange(60,260)]"
                                  />
                                </v-col>
                                <v-col cols="12" sm="6">
                                  <v-text-field
                                    v-model.number="user.hypertensionRecentDia"
                                    label="舒張壓"
                                    type="number"
                                    suffix="mmHg"
                                    variant="outlined"
                                    :rules="[intRange(30,160)]"
                                  />
                                </v-col>
                              </v-row>

                              <v-label class="mb-2 d-inline-block">目前血壓用藥</v-label>
                              <v-radio-group v-model="user.hypertensionMedicationAdherence" inline>
                                <v-radio label="無" value="none" />
                                <v-radio label="有規律服藥" value="regular" />
                                <v-radio label="不規律服藥" value="irregular" />
                              </v-radio-group>

                              <v-text-field
                                v-if="user.hypertensionMedicationAdherence!=='none'"
                                v-model="user.hypertensionMedNames"
                                label="藥名"
                                variant="outlined"
                                clearable
                              />
                            </template>

                            <!-- 其他（請自行描述）：單一輸入框 -->
                            <template v-else-if="symptom.key==='otherSymptom'">
                              <v-text-field
                                v-model="user.otherDescription"
                                variant="outlined"
                                placeholder="請輸入描述..."
                                clearable
                              />
                            </template>

                            <!-- 其餘群組：通用欄位 -->
                            <template v-else>
                              <v-row>
                                <v-col cols="12" sm="6">
                                  <v-text-field
                                    v-model.number="user[`${symptom.key}DurationValue`]"
                                    label="發生多久（數值）"
                                    type="number"
                                    variant="outlined"
                                  />
                                </v-col>
                                <v-col cols="12" sm="6">
                                  <v-select
                                    v-model="user[`${symptom.key}DurationUnit`]"
                                    :items="durationUnits"
                                    label="單位"
                                    variant="outlined"
                                  />
                                </v-col>
                              </v-row>

                              <v-select
                                v-model="user[`${symptom.key}Frequency`]"
                                :items="frequencyOptions"
                                label="發作頻率"
                                variant="outlined"
                              />

                              <v-row class="mt-1">
                                <v-col cols="12" sm="6">
                                  <v-select
                                    v-model="user[`${symptom.key}When`]"
                                    :items="whenOptions"
                                    label="發作時間（情境）"
                                    variant="outlined"
                                    multiple chips
                                  />
                                </v-col>
                                <v-col cols="12" sm="3">
                                  <v-text-field
                                    v-model.number="user[`${symptom.key}EpisodeValue`]"
                                    label="每次持續（數值）"
                                    type="number"
                                    variant="outlined"
                                  />
                                </v-col>
                                <v-col cols="12" sm="3">
                                  <v-select
                                    v-model="user[`${symptom.key}EpisodeUnit`]"
                                    :items="episodeUnits"
                                    label="單位"
                                    variant="outlined"
                                  />
                                </v-col>
                              </v-row>
                            </template>
                          </div>
                        </v-expand-transition>
                      </template>
                    </v-card-text>
                  </v-card>

                  <!-- ▼▼ 病史 ▼▼ -->
                  <v-divider class="my-6" />
                  <v-autocomplete v-model="user.tags1" :items="sickHistory1" label="過去病史1（請進入勾選）" chips multiple variant="outlined" />
                  <v-autocomplete v-model="user.tags2" :items="sickHistory2" label="過去病史2（請進入勾選）" chips multiple variant="outlined" />
                  <v-autocomplete v-model="user.FamilyHistory" :items="FamilyHistory" label="家族病史（請進入勾選）" chips multiple variant="outlined" />

                  <!-- 手術史 -->
                  <v-divider class="my-4" />
                  <v-label class="mb-2 d-inline-block">過去手術史</v-label>
                  <v-radio-group v-model="user.opHistory" inline>
                    <v-radio label="無" value="none" />
                    <v-radio label="有" value="yes" />
                  </v-radio-group>
                  <v-expand-transition>
                    <div v-if="user.opHistory==='yes'">
                      <v-text-field v-model="user.surgeryName" label="手術名稱" variant="outlined" clearable />
                    </div>
                  </v-expand-transition>

                  <!-- 藥物過敏 -->
                  <v-label class="mb-2 d-inline-block mt-4">藥物過敏</v-label>
                  <v-radio-group v-model="user.drugAllergy" inline>
                    <v-radio label="無" value="none" />
                    <v-radio label="有" value="yes" />
                  </v-radio-group>
                  <v-expand-transition>
                    <div v-if="user.drugAllergy==='yes'">
                      <v-text-field v-model="user.allergyName" label="過敏藥物名稱" variant="outlined" clearable />
                    </div>
                  </v-expand-transition>

                  <v-btn type="submit" color="primary" class="mt-4">送出</v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-snackbar v-model="snackbar" color="success">表單送出成功！</v-snackbar>
      </v-container>
    </v-main>

    <v-footer app color="grey-lighten-3">
      <v-spacer />
      <span class="text-caption">© 2025 心臟內科初診病人問診表</span>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useHead } from '#imports'

useHead({ title: '心臟內科初診病人問診表9' })

const drawer = ref(false)
const snackbar = ref(false)

/* === 主訴 9 群組（含胸悶與其他） === */
const symptomGroups = [
  { key: 'chestTightness', label: '胸悶' },
  { key: 'chestPain', label: '胸痛' },
  { key: 'dyspnea', label: '呼吸喘' },
  { key: 'palpitation', label: '心悸' },
  { key: 'dizziness', label: '暈眩' },
  { key: 'edema', label: '水腫' },
  { key: 'claudication', label: '間歇性跛行(走路時下肢酸痛)' },
  { key: 'hypertensionPoorControl', label: '血壓控制不良' },
  { key: 'otherSymptom', label: '其他（請自行描述）' },
]

/* === 特定群組選項 === */
const palpitationOptions = ['跳太快', '跳太慢', '不規律', '跳太用力', '跳不起來', '心臟無力感']
const dizzinessOptions = ['又暈又眩', '頭重重的（無旋轉/無晃動感）', '合併昏倒/快昏倒/失去意識']
const edemaOptions = ['全身', '單腳', '雙腳']

/* === 使用者資料 === */
const user = ref<any>({
  name: '', gender: 'male', age: null,
  heightCm: null, weightKg: null, bmi: null,
  bpSys: null, bpDia: null,

  // 產生所有群組的通用欄位
  ...Object.fromEntries(symptomGroups.flatMap(s => [
    [s.key, 'none'],
    [`${s.key}DurationValue`, null],
    [`${s.key}DurationUnit`, null],
    [`${s.key}Frequency`, null],
    [`${s.key}When`, []],
    [`${s.key}EpisodeValue`, null],
    [`${s.key}EpisodeUnit`, null],
  ])),

  // 特定群組附加資料
  palpitationType: [],
  dizzinessType: [],
  edemaType: [],
  chestPainLocation: '',

  // 血壓控制不良 專屬欄位
  hypertensionRecentSys: null,
  hypertensionRecentDia: null,
  hypertensionMedicationAdherence: null, // 'none' | 'regular' | 'irregular'
  hypertensionMedNames: '',

  // 其他（請自行描述）
  otherDescription: '',

  // 病史 / 手術史 / 藥物過敏
  tags1: [], tags2: [], FamilyHistory: [],
  opHistory: 'none', surgeryName: '',
  drugAllergy: 'none', allergyName: '',
})

/* === 下拉選項 === */
const durationUnits = ['天', '週', '月', '年']
const frequencyOptions = ['每天', '2~3天一次', '1週一次', '偶爾一次']
const whenOptions = ['休息時', '運動時', '睡覺時']
const episodeUnits = ['秒', '分', '小時', '天']

/* === 過去病史選項（可自行擴充） === */
const sickHistory1 = ['高血壓','心衰竭','高血脂','心肌梗塞','冠狀動脈疾病','糖尿病']
const sickHistory2 = ['B型肝炎','C型肝炎','惡性腫瘤']
const FamilyHistory = ['中風','冠狀動脈疾病/心肌梗塞','猝死']

/* === 規則 & 自動行為 === */
const oneDecimal = (v:any)=>v===''||v==null||/^(\d+|\d+\.\d)$/.test(String(v))||'僅允許到小數一位'
const positive  = (v:any)=>v===''||v==null||Number(v)>0||'需大於 0'
const intRange  = (min:number,max:number,msg?:string)=>(v:any)=>v===''||v==null||(Number.isInteger(+v)&&+v>=min&&+v<=max)||(msg??`請輸入 ${min}-${max}`)
const ageRules  = [(v:any)=>v===''||v==null?'請輸入年齡':(+v>0)||'需大於 0']

watch(()=>[user.value.heightCm,user.value.weightKg],([h,w])=>{
  const H=+h, W=+w
  user.value.bmi = (H>0 && W>0) ? Math.round(W/(H/100)**2*10)/10 : null
},{immediate:true})

watch(()=>user.value.hypertensionMedicationAdherence, val=>{
  if(val==='none') user.value.hypertensionMedNames = ''
})

function submitForm(){
  console.log('送出資料：', user.value)
  snackbar.value = true
}
function toggleTheme(){
  document.querySelector('html')?.classList.toggle('v-theme--dark')
}
</script>
