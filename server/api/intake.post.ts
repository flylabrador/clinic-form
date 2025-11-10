// server/api/intake.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // 簡單驗證（示範）
    if (!body?.name) {
      setResponseStatus(event, 400)
      return { ok: false, message: 'Name is required' }
    }

    // TODO: 在此寫入資料庫 / 呼叫外部 API
    // 模擬延遲
    await new Promise(r => setTimeout(r, 300))

    return { ok: true, message: 'received', at: new Date().toISOString(), echo: body }
  } catch (err: any) {
    setResponseStatus(event, 500)
    return { ok: false, message: err?.message || 'Server error' }
  }
})
