import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AWS Signature V4 implementation for R2
async function signRequest(
  method: string,
  url: URL,
  headers: Record<string, string>,
  body: ArrayBuffer | null,
  accessKeyId: string,
  secretAccessKey: string,
  region: string = 'auto'
): Promise<Record<string, string>> {
  const service = 's3';
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  
  // Calculate payload hash
  let payloadHash = 'UNSIGNED-PAYLOAD';
  if (body) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', body);
    payloadHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  const signedHeaders = Object.keys(headers).sort().join(';').toLowerCase();
  const canonicalHeaders = Object.entries(headers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}`)
    .join('\n') + '\n';
  
  const canonicalRequest = [
    method,
    url.pathname,
    url.search.slice(1),
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  const canonicalHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest));
  const canonicalRequestHash = Array.from(new Uint8Array(canonicalHashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    canonicalRequestHash
  ].join('\n');
  
  // Create signing key
  const encoder = new TextEncoder();
  
  const kDateKey = await crypto.subtle.importKey(
    'raw', 
    encoder.encode('AWS4' + secretAccessKey), 
    { name: 'HMAC', hash: 'SHA-256' }, 
    false, 
    ['sign']
  );
  const kDate = await crypto.subtle.sign('HMAC', kDateKey, encoder.encode(dateStamp));
  
  const kRegionKey = await crypto.subtle.importKey(
    'raw', kDate, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const kRegion = await crypto.subtle.sign('HMAC', kRegionKey, encoder.encode(region));
  
  const kServiceKey = await crypto.subtle.importKey(
    'raw', kRegion, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const kService = await crypto.subtle.sign('HMAC', kServiceKey, encoder.encode(service));
  
  const kSigningKey = await crypto.subtle.importKey(
    'raw', kService, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', kSigningKey, encoder.encode(stringToSign));
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return {
    ...headers,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
    'Authorization': `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessKeyId = Deno.env.get('R2_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY');
    const bucketName = Deno.env.get('R2_BUCKET_NAME');
    const endpoint = Deno.env.get('R2_ENDPOINT');
    const publicUrl = Deno.env.get('R2_PUBLIC_URL');

    if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint || !publicUrl) {
      console.error('Missing R2 configuration');
      return new Response(
        JSON.stringify({ error: 'R2 configuration not complete' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📤 Uploading file: ${file.name} (${file.size} bytes) to folder: ${folder}`);

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().slice(0, 8);
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 50);
    const key = `${folder}/${timestamp}-${randomId}-${safeName}`;

    // Read file as ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Build URL for R2
    const r2Url = new URL(`${endpoint}/${bucketName}/${key}`);
    
    // Prepare headers
    const headers: Record<string, string> = {
      'host': r2Url.host,
      'content-type': file.type || 'application/octet-stream',
      'content-length': fileBuffer.byteLength.toString(),
    };

    // Sign the request
    const signedHeaders = await signRequest(
      'PUT',
      r2Url,
      headers,
      fileBuffer,
      accessKeyId,
      secretAccessKey
    );

    // Upload to R2
    const uploadResponse = await fetch(r2Url.toString(), {
      method: 'PUT',
      headers: signedHeaders,
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('R2 upload failed:', uploadResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Upload failed', details: errorText }),
        { status: uploadResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct public URL
    const fileUrl = `${publicUrl.replace(/\/$/, '')}/${key}`;
    
    console.log(`✅ Upload successful: ${fileUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: fileUrl,
        key: key,
        size: file.size,
        type: file.type
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ R2 upload error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
