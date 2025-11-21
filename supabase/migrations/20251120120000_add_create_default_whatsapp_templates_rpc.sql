CREATE OR REPLACE FUNCTION create_default_whatsapp_templates(p_user_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert default templates
  INSERT INTO whatsapp_templates (user_id, name, category, description, template_content, variables, is_active, is_default)
  VALUES
    (
      p_user_id, 
      'Konfirmasi Pesanan Baru', 
      'order_confirmation', 
      'Template untuk konfirmasi pesanan yang baru masuk', 
      'Halo {customer_name}! ✅

Pesanan Anda telah kami terima dan sedang diproses:

📋 No. Pesanan: {order_no}
📅 Tanggal: {order_date}

🛒 Detail Pesanan:
{order_items}

💰 Total: {total_amount}
🚚 Pengiriman: {delivery_date}
📍 Alamat: {delivery_address}

{notes}

Terima kasih sudah order! 🙏

{business_name}
📞 {business_phone}', 
      '["customer_name", "order_no", "order_date", "order_items", "total_amount", "delivery_date", "delivery_address", "notes", "business_name", "business_phone"]'::jsonb, 
      true, 
      false
    ),
    (
      p_user_id,
      'Pengingat Pengiriman',
      'order_reminder',
      'Pengingat sebelum pesanan dikirim',
      'Halo {customer_name}! 🚚

Pesanan Anda akan segera dikirim:

📋 No. Pesanan: {order_no}

🛒 Item:
{order_items}

💰 Total: {total_amount}
🕐 Estimasi tiba: {estimated_time}
📍 Alamat: {delivery_address}

Mohon pastikan ada yang menerima ya! 🙏

{business_name}
📞 {business_phone}',
      '["customer_name", "order_no", "order_items", "total_amount", "estimated_time", "delivery_address", "business_name", "business_phone"]'::jsonb,
      true,
      false
    ),
    (
      p_user_id,
      'Update Status Pengiriman',
      'delivery_update',
      'Update status pengiriman real-time',
      'Halo {customer_name}! 📍

Update pesanan Anda:

📋 No. Pesanan: {order_no}
📦 Status: {delivery_status}
🕐 Estimasi: {estimated_time}

👤 Driver: {driver_name}
📞 Kontak Driver: {driver_phone}

Terima kasih! 🙏

{business_name}',
      '["customer_name", "order_no", "delivery_status", "estimated_time", "driver_name", "driver_phone", "business_name"]'::jsonb,
      true,
      false
    ),
    (
      p_user_id,
      'Pengingat Pembayaran',
      'payment_reminder',
      'Reminder untuk pembayaran yang belum lunas',
      'Halo {customer_name}! 💳

Ini pengingat pembayaran untuk pesanan Anda:

📋 No. Pesanan: {order_no}

🛒 Item:
{order_items}

💰 Total Tagihan: {total_amount}
⏰ Batas Pembayaran: {payment_deadline}

💳 Transfer ke:
{payment_account}

Setelah transfer, mohon konfirmasi ya! 🙏

{business_name}
📞 {business_phone}',
      '["customer_name", "order_no", "order_items", "total_amount", "payment_deadline", "payment_account", "business_name", "business_phone"]'::jsonb,
      true,
      false
    ),
    (
      p_user_id,
      'Pesanan Selesai',
      'order_completed',
      'Notifikasi pesanan telah selesai diterima',
      'Halo {customer_name}! ✅

Pesanan Anda telah selesai:

📋 No. Pesanan: {order_no}
📅 Tanggal: {order_date}

🛒 Item:
{order_items}

💰 Total: {total_amount}

Terima kasih sudah order! 🙏
Ditunggu orderan selanjutnya ya! 😊

{business_name}
📞 {business_phone}',
      '["customer_name", "order_no", "order_date", "order_items", "total_amount", "business_name", "business_phone"]'::jsonb,
      true,
      false
    ),
    (
      p_user_id,
      'Follow Up & Rating',
      'follow_up',
      'Follow up dan minta feedback pelanggan',
      'Halo {customer_name}! ⭐

Terima kasih sudah order di {business_name}!

Bagaimana pengalaman Anda dengan:
{order_items}

Apakah Anda puas dengan pelayanan kami?
Berikan rating dan ulasan ya! 🙏

Kami tunggu orderan selanjutnya! 😊

{business_name}
📞 {business_phone}',
      '["customer_name", "order_items", "business_name", "business_phone"]'::jsonb,
      true,
      false
    )
  ON CONFLICT DO NOTHING;
END;
$$;
