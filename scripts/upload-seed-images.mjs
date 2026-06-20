/**
 * public/images の画像を Supabase Storage にアップロードし、
 * visit_images を本番形式の storage_path で登録します。
 *
 * 事前準備:
 *   .env.local に SUPABASE_SERVICE_ROLE_KEY を追加
 *   npm run seed:storage
 *
 * ※ 開発中は seed_personas.sql（local/ パス）の方が手軽です
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnv() {
  const envPath = join(root, '.env.local')
  if (!existsSync(envPath)) {
    throw new Error('.env.local が見つかりません')
  }

  const env = {}
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...rest] = trimmed.split('=')
    env[key] = rest.join('=')
  }
  return env
}

const SEED_IMAGES = [
  {
    file: 'nail01.jpg',
    customerId: '11111111-1111-1111-1111-111111111111',
    visitId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  },
  {
    file: 'nail02.jpg',
    customerId: '22222222-2222-2222-2222-222222222222',
    visitId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  },
  {
    file: 'nail03.jpg',
    customerId: '33333333-3333-3333-3333-333333333333',
    visitId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  },
  {
    file: 'nail04.jpg',
    customerId: '44444444-4444-4444-4444-444444444444',
    visitId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
  },
  {
    file: 'nail05.jpg',
    customerId: '55555555-5555-5555-5555-555555555555',
    visitId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  },
]

async function main() {
  const env = loadEnv()
  const url = env.VITE_SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error(
      'VITE_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env.local に設定してください',
    )
    console.error('Service Role Key: Supabase Dashboard → Settings → API')
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey)

  for (const item of SEED_IMAGES) {
    const filePath = join(root, 'public', 'images', item.file)
    if (!existsSync(filePath)) {
      throw new Error(`画像が見つかりません: ${filePath}`)
    }

    const storagePath = `${item.customerId}/${item.visitId}/${item.file}`
    const body = readFileSync(filePath)

    console.log(`Uploading ${item.file} → ${storagePath}`)

    const { error: uploadError } = await supabase.storage
      .from('nail-images')
      .upload(storagePath, body, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadError) throw uploadError

    await supabase
      .from('visit_images')
      .delete()
      .eq('visit_id', item.visitId)

    const { error: insertError } = await supabase.from('visit_images').insert({
      visit_id: item.visitId,
      storage_path: storagePath,
    })

    if (insertError) throw insertError
  }

  console.log('完了: 5件の画像を Supabase Storage にアップロードしました')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
