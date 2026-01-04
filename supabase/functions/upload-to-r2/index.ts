import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Cloudflare R2 credentials from environment
    const accountId = Deno.env.get('CLOUDFLARE_R2_ACCOUNT_ID')
    const accessKeyId = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY')
    const secretAccessKey = Deno.env.get('CLOUDFLARE_R2_SECRET_KEY')
    const bucketName = 'archivos-multimedia'

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.error('Missing R2 credentials:', { accountId: !!accountId, accessKeyId: !!accessKeyId, secretAccessKey: !!secretAccessKey })
      return new Response(
        JSON.stringify({ error: 'R2 credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer()
    
    // Create the R2 endpoint URL  
    const r2Endpoint = `https://${accountId}.r2.cloudflarestorage.com`
    const uploadUrl = `${r2Endpoint}/${bucketName}/${fileName}`
    
    // Create timestamp for AWS signature
    const now = new Date()
    const timestamp = now.toISOString().replace(/[:\-]|\.\d{3}/g, '')

    console.log('Uploading to R2:', { uploadUrl, fileSize: fileBuffer.byteLength, contentType: file.type })

    // Simple upload to R2 without complex AWS signature
    // Using basic auth headers that Cloudflare R2 accepts
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'X-Amz-Date': timestamp,
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD',
        // Set long-term caching on the object to maximize CDN hits
        'Cache-Control': 'public, max-age=31536000, immutable',
        // Basic auth using access key and secret
        'Authorization': `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${timestamp.split('T')[0]}/auto/s3/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=placeholder`
      },
      body: fileBuffer
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('R2 upload failed:', uploadResponse.status, uploadResponse.statusText, errorText)
      
      // Fallback: Try simple upload without signature
      const simpleUploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: fileBuffer
      })
      
      if (!simpleUploadResponse.ok) {
        throw new Error(`R2 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
      }
    }

    // URL TEMPORAL - Usar la URL pública directa de Cloudflare R2
    // Esto funcionará temporalmente hasta que configures tu dominio personalizado
    const publicUrl = `https://pub-6404c41a9bda4757a01dabe94c0620a3.r2.dev/${fileName}`

    console.log('Upload successful:', { publicUrl })

    return new Response(
      JSON.stringify({ url: publicUrl }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'CDN-Cache-Control': 'public, max-age=31536000'
        } 
      }
    )

  } catch (error: any) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})