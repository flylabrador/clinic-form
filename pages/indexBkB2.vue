<template>
  <v-app>
    <!-- 置頂 App Bar：加上 app 才不會遮住內容 -->
    <v-app-bar app color="primary" flat>
      <v-app-bar-title>心臟內科初診病人問診表B2</v-app-bar-title>
      <v-spacer />
      <v-btn icon="mdi-theme-light-dark" @click="toggleTheme" />
      <v-btn icon="mdi-menu" @click="drawer = !drawer" />
    </v-app-bar>

    <!-- 側邊導覽列：加上 app -->
    <v-navigation-drawer app v-model="drawer" temporary>
      <v-list nav>
        <v-list-item prepend-icon="mdi-home" title="首頁" />
        <v-list-item prepend-icon="mdi-form-textbox" title="表單" />
        <v-list-item prepend-icon="mdi-table" title="表格" />
      </v-list>
    </v-navigation-drawer>

    <!-- 主內容 -->
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card elevation="2">
            <v-card-title class="text-red font-weight-bold text-center">
                初診病人若看診原因為嚴重胸悶、胸痛、血壓大於200mmHg，請至急診就醫！
            </v-card-title>
              <v-card-text>
                <v-form @submit.prevent="submitForm">
                  <!-- 基本資料（可收合） -->
                  <v-expansion-panels v-model="panelsBasic" class="mb-6">
                    <v-expansion-panel elevation="1">
                      <v-expansion-panel-title>
                        <span class="text-subtitle-1">基本資料</span>
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <!-- 姓名 / 看診號碼 -->
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model="user.name"
                              label="姓名"
                              variant="outlined"
                              prepend-inner-icon="mdi-account"
                              required
                            />
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model.number="user.visitNumber"
                              label="看診號碼"
                              type="number"
                              inputmode="numeric"
                              variant="outlined"
                              :rules="[intPositive]"
                              suffix="號"
                            />
                          </v-col>
                        </v-row>

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
                              :rules="[positive, oneDecimal]"
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
                              :rules="[positive, oneDecimal]"
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
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>

                  <!-- 主訴（可收合 + 小計數） -->
                  <v-expansion-panels v-model="panelsComplaint" class="mt-2">
                    <v-expansion-panel elevation="1">
                      <v-expansion-panel-title>
                        <div class="d-flex align-center w-100">
                          <span class="text-subtitle-1">主訴（主要掛號原因）</span>
                          <v-spacer />
                          <v-chip size="small" color="primary" variant="flat">
                            已勾選 {{ complaintCount }} 項
                          </v-chip>
                        </div>
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <template v-for="symptom in symptomGroups" :key="symptom.key">
                          <v-divider class="my-4" />
                          <v-label class="mb-2 d-inline-block">{{ symptom.label }}</v-label>
                          <v-radio-group v-model="user[symptom.key]" inline>
                            <v-radio label="無" value="none" />
                            <v-radio label="有" value="yes" />
                          </v-radio-group>

                          <v-expand-transition>
                            <div v-if="user[symptom.key] === 'yes'">
                              <!-- 胸悶痛：疼痛位置 -->
                              <template v-if="symptom.key === 'chestTightnessPain'">
                                <v-text-field
                                  v-model="user.chestTightnessPainLocation"
                                  label="疼痛位置"
                                  variant="outlined"
                                  placeholder="例如：胸骨後、左胸、右胸、放射到手臂等"
                                  clearable
                                />
                                
                                <!-- 胸悶痛：昏倒情形 -->
                                <v-label class="mb-2 d-inline-block">昏倒情形</v-label>
                                <v-radio-group
                                  v-model="user.chestTightnessPainSyncope"
                                  inline
                                >
                                  <v-radio label="無" value="none" />
                                  <v-radio label="昏倒" value="syncope" />
                                  <v-radio label="快昏倒" value="nearSyncope" />
                                </v-radio-group>


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

                              <!-- 其他（請自行描述） -->
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
                              </template>
                            </div>
                          </v-expand-transition>
                        </template>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>

                  <!-- 病史（可收合，無計數） -->
                  <v-expansion-panels v-model="panelsHistory" class="mt-6">
                    <v-expansion-panel elevation="1">
                      <v-expansion-panel-title>
                        <span class="text-subtitle-1">病史</span>
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <v-autocomplete
                          v-model="user.tags1"
                          :items="sickHistory1"
                          label="過去病史1（請進入勾選）"
                          chips multiple variant="outlined"
                        />

                        <!-- 過去病史2 + 勾選後逐項補充 -->
                        <v-autocomplete
                          v-model="user.tags2"
                          :items="sickHistory2"
                          label="過去病史2（請進入勾選）"
                          chips multiple variant="outlined"
                        />
                        <div v-if="user.tags2?.length" class="mt-2">
                          <v-row v-for="d in user.tags2" :key="d" class="mb-1">
                            <v-col cols="12">
                              <v-text-field
                                v-model="user.tags2Notes[d]"
                                :label="`${d}（補充說明）`"
                                variant="outlined"
                                clearable
                                :rules="d === '其他慢性病' ? [noteRequiredIfSelected('其他慢性病')] : []"
                              />
                            </v-col>
                          </v-row>
                        </div>

                        <v-autocomplete
                          v-model="user.FamilyHistory"
                          :items="FamilyHistory"
                          label="家族病史（請進入勾選）"
                          chips multiple variant="outlined"
                        />
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>

                  <!-- ====== 手術史 / 藥物過敏 ====== -->
                  <v-divider class="my-4" />

                  <!-- 過去手術史 -->
                  <v-label class="mb-2 d-inline-block">過去手術史</v-label>
                  <v-radio-group v-model="user.opHistory" inline>
                    <v-radio label="無" value="none" />
                    <v-radio label="有" value="yes" />
                  </v-radio-group>
                  <v-expand-transition>
                    <div v-if="user.opHistory === 'yes'">
                      <v-text-field
                        v-model="user.surgeryName"
                        label="手術名稱"
                        variant="outlined"
                        clearable
                        :rules="[requiredIf('opHistory','yes')]"
                      />
                    </div>
                  </v-expand-transition>

                  <!-- 藥物過敏 -->
                  <v-label class="mb-2 d-inline-block mt-4">藥物過敏</v-label>
                  <v-radio-group v-model="user.drugAllergy" inline>
                    <v-radio label="無" value="none" />
                    <v-radio label="有" value="yes" />
                  </v-radio-group>
                  <v-expand-transition>
                    <div v-if="user.drugAllergy === 'yes'">
                      <v-text-field
                        v-model="user.allergyName"
                        label="過敏藥物名稱"
                        variant="outlined"
                        clearable
                        :rules="[requiredIf('drugAllergy','yes')]"
                      />
                    </div>
                  </v-expand-transition>

                  <!-- 生活背景（新增區塊） -->
                  <v-divider class="my-6" />
                  <v-label class="mb-2 d-inline-block">生活背景</v-label>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="user.livingStatus"
                        :items="livingStatusItems"
                        label="居住情形"
                        variant="outlined"
                        placeholder="請選擇：獨居 / 與家人同住"
                        clearable
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="user.educationLevel"
                        :items="educationLevels"
                        label="教育程度"
                        variant="outlined"
                        placeholder="請選擇教育程度"
                        clearable
                      />
                    </v-col>
                  </v-row>

                  <!-- 抽菸（有條件顯示欄位） -->
                  <v-label class="mb-2 d-inline-block mt-2">抽菸</v-label>
                  <v-radio-group v-model="user.smokingStatus" inline>
                    <v-radio label="無" value="none" />
                    <v-radio label="有" value="yes" />
                    <v-radio label="已戒菸" value="quit" />
                  </v-radio-group>

                  <v-expand-transition>
                    <div v-if="user.smokingStatus === 'yes'">
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model.number="user.smokeYears"
                            label="菸齡（年）"
                            type="number"
                            step="0.1"
                            variant="outlined"
                            :rules="[requiredIf('smokingStatus','yes'), positive, oneDecimal]"
                          />
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model.number="user.smokePerDay"
                            label="每天支數（支）"
                            type="number"
                            inputmode="numeric"
                            variant="outlined"
                            :rules="[requiredIf('smokingStatus','yes'), intPositive]"
                          />
                        </v-col>
                      </v-row>
                    </div>
                  </v-expand-transition>

                  <v-expand-transition>
                    <div v-if="user.smokingStatus === 'quit'">
                      <v-text-field
                        v-model.number="user.smokeYears"
                        label="菸齡（年）"
                        type="number"
                        step="0.1"
                        variant="outlined"
                        :rules="[requiredIf('smokingStatus','quit'), positive, oneDecimal]"
                      />
                    </div>
                  </v-expand-transition>

                  <!-- 喝酒（有條件顯示欄位） -->
                  <v-label class="mb-2 d-inline-block mt-4">喝酒</v-label>
                  <v-radio-group v-model="user.alcoholStatus" inline>
                    <v-radio label="無" value="none" />
                    <v-radio label="有" value="yes" />
                  </v-radio-group>

                  <v-expand-transition>
                    <div v-if="user.alcoholStatus === 'yes'">
                      <v-row>
                        <v-col cols="12" sm="4">
                          <v-text-field
                            v-model.number="user.alcoholAmountCc"
                            label="喝多少（cc）"
                            type="number"
                            variant="outlined"
                            :rules="[requiredIf('alcoholStatus','yes'), positive]"
                          />
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-text-field
                            v-model.number="user.alcoholFrequencyDays"
                            label="多久喝一次（天）"
                            type="number"
                            variant="outlined"
                            :rules="[requiredIf('alcoholStatus','yes'), positive]"
                          />
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-text-field
                            v-model="user.alcoholDrinkName"
                            label="酒名"
                            variant="outlined"
                            :rules="[requiredIf('alcoholStatus','yes')]"
                            clearable
                          />
                        </v-col>
                      </v-row>
                    </div>
                  </v-expand-transition>

                  <v-btn type="submit" color="primary" class="mt-6">送出</v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-snackbar v-model="snackbar" color="success">表單送出成功！</v-snackbar>
      </v-container>
    </v-main>

    <!-- Footer：加上 app -->
    <v-footer app color="grey-lighten-3">
      <v-spacer />
      <span class="text-caption">© 2025 心臟內科初診病人問診表</span>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const drawer = ref(false)
const snackbar = ref(false)
const panelsBasic = ref([0])
const panelsComplaint = ref([0])
const panelsHistory = ref([])

/* 主訴 9 群組 */
const symptomGroups = [
  { key: 'chestTightnessPain', label: '胸悶痛' },
  { key: 'dyspnea', label: '呼吸喘' },
  { key: 'palpitation', label: '心悸' },
  { key: 'dizziness', label: '暈眩' },
  { key: 'edema', label: '水腫' },
  { key: 'claudication', label: '間歇性跛行(走路時下肢酸痛)' },
  { key: 'hypertensionPoorControl', label: '血壓控制不良' },
  { key: 'otherSymptom', label: '其他（請自行描述）' },
]

const complaintCount = computed(() =>
  symptomGroups.reduce((acc, s) => acc + (user.value[s.key] === 'yes' ? 1 : 0), 0)
)

/* 特定選項 */
const palpitationOptions = ['跳太快', '跳太慢', '不規律', '跳太用力', '跳不起來', '心臟無力感']
const dizzinessOptions = ['又暈又眩', '頭重重的（無旋轉/無晃動感）', '合併昏倒/快昏倒/失去意識']
const edemaOptions = ['全身', '單腳', '雙腳']

/* 生活背景下拉資料 */
const livingStatusItems = ['獨居', '與家人同住']
const educationLevels = ['無', '小學', '國中', '高中', '專科', '大學', '碩士', '博士']

/* 使用者資料（含主訴/病史/手術史/藥物過敏/生活背景/抽菸/喝酒） */
const user = ref<any>({
  name: '',
  visitNumber: null,
  gender: 'male',
  age: null,
  heightCm: null,
  weightKg: null,
  bmi: null,
  bpSys: null,
  bpDia: null,

  // 主訴群組通用欄位
  ...Object.fromEntries(symptomGroups.flatMap(s => [
    [s.key, 'none'],
    [`${s.key}DurationValue`, null],
    [`${s.key}DurationUnit`, null],
    [`${s.key}Frequency`, null],
  ])),

  // 特定主訴附加資料
  palpitationType: [],
  dizzinessType: [],
  edemaType: [],
  chestTightnessPainLocation: '',
  chestTightnessPainSyncope: 'none', // 胸悶痛-昏倒情形：none/syncope/nearSyncope
  hypertensionRecentSys: null,
  hypertensionRecentSys: null,
  hypertensionRecentDia: null,
  hypertensionMedicationAdherence: null, // 'none' | 'regular' | 'irregular'
  hypertensionMedNames: '',
  otherDescription: '',

  // 病史
  tags1: [],
  tags2: [],
  tags2Notes: {} as Record<string, string>, // ★ 新增：過去病史2逐項補充
  FamilyHistory: [],

  // 手術史 / 藥物過敏
  opHistory: 'none',
  surgeryName: '',
  drugAllergy: 'none',
  allergyName: '',

  // 生活背景
  livingStatus: null,       // '獨居' | '與家人同住'
  educationLevel: null,     // '無' | ... | '博士'

  // 抽菸
  smokingStatus: 'none',    // 'none' | 'yes' | 'quit'
  smokeYears: null,         // number (>0, 一位小數)
  smokePerDay: null,        // int (>0)

  // 喝酒
  alcoholStatus: 'none',    // 'none' | 'yes'
  alcoholAmountCc: null,    // number (>0)
  alcoholFrequencyDays: null, // number (>0)
  alcoholDrinkName: '',     // string
})

/* 下拉選項（通用） */
const durationUnits = ['天', '週', '月', '年']
const frequencyOptions = ['每天', '2~3天一次', '1週一次', '偶爾一次']
const sickHistory1 = [
  '高血壓', '心衰竭', '高血脂', '心肌梗塞', '冠狀動脈疾病',
  '瓣膜性心臟病', '週邊動脈阻塞', '心律不整', '心臟節律器', '心臟去顫器',
  '糖尿病', '中風', '慢性腎衰竭', '氣喘', 'COPD',
  '消化性潰瘍', '胃食道逆流', 'B型肝炎', 'C型肝炎', '肝硬化', '甲狀腺亢進', '甲狀腺低下', '貧血',
]
const sickHistory2 = ['心律不整', '慢性肺部疾病',  '惡性腫瘤', '其他慢性病']
const FamilyHistory = ['中風', '冠狀動脈疾病/心肌梗塞', '猝死', '惡性腫瘤']

/* 驗證規則 */
const oneDecimal = (v:any)=>v===''||v==null||/^(\d+|\d+\.\d)$/.test(String(v))||'僅允許到小數一位'
const positive  = (v:any)=>v===''||v==null||Number(v)>0||'需大於 0'
const intPositive = (v:any)=> {
  if (v === '' || v == null) return '必填'
  const n = Number(v)
  return (Number.isInteger(n) && n > 0) || '請輸入大於 0 的整數'
}
const intRange  = (min:number,max:number,msg?:string)=>(v:any)=>
  v===''||v==null||(Number.isInteger(+v)&&+v>=min&&+v<=max)||(msg??`請輸入 ${min}-${max}`)
const ageRules  = [
  (v:any)=> v===''||v==null ? '請輸入年齡'
         : (+v>0) ? true : '需大於 0'
]

/* 只有在特定條件時才必填（含手術史/藥物過敏/抽菸/喝酒） */
const requiredIf = (field:keyof typeof user.value, expected:any) => (v:any) => {
  if (user.value[field] === expected) {
    if (Array.isArray(v)) return v.length > 0 || '此欄位為必填'
    return (v !== '' && v != null) || '此欄位為必填'
  }
  return true
}

/* 「其他慢性病」若被勾選則補充必填（可自行移除） */
const noteRequiredIfSelected = (tag: string) => (v: any) => {
  return user.value.tags2.includes(tag)
    ? ((v != null && String(v).trim() !== '') || '請補充說明')
    : true
}

/* BMI 自動計算 */
watch(()=>[user.value.heightCm,user.value.weightKg],([h,w])=>{
  const H=+h, W=+w
  user.value.bmi = (H>0 && W>0) ? Math.round(W/(H/100)**2*10)/10 : null
},{immediate:true})

/* 當血壓用藥選無時，清空藥名 */
watch(()=>user.value.hypertensionMedicationAdherence, val=>{
  if(val==='none') user.value.hypertensionMedNames = ''
})

/* 抽菸：切換狀態時清理不需要的欄位（避免殘值） */
watch(()=>user.value.smokingStatus, s=>{
  if(s==='none'){ user.value.smokeYears=null; user.value.smokePerDay=null }
  if(s==='quit'){ user.value.smokePerDay=null } // quit 不需要每天支數
})

/* 喝酒：切換無時清空欄位 */
watch(()=>user.value.alcoholStatus, s=>{
  if(s==='none'){
    user.value.alcoholAmountCc=null
    user.value.alcoholFrequencyDays=null
    user.value.alcoholDrinkName=''
  }
})

function submitForm(){
  // 若後端需要結構化：把 tags2 與備註合併
  const tags2WithNotes = user.value.tags2.map((name:string)=>({
    name,
    note: user.value.tags2Notes[name] || ''
  }))
  const payload = { ...user.value, tags2WithNotes }
  console.log('送出資料：', payload)
  snackbar.value = true
}
function toggleTheme(){
  document.querySelector('html')?.classList.toggle('v-theme--dark')
}
</script>
