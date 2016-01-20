require "base64"
require "openssl"

module SignedPayload

  class << self
    def verify(signed_payload, client_secret)
      message_parts = signed_payload.split(".")

      encoded_json_payload = message_parts[0]
      encoded_hmac_signature = message_parts[1]

      payload_object = Base64.strict_decode64(encoded_json_payload)
      provided_signature = Base64.strict_decode64(encoded_hmac_signature)

      expected_signature = OpenSSL::HMAC::hexdigest("sha256", client_secret, payload_object)

      return false unless secure_compare(expected_signature, provided_signature)

      JSON.parse(payload_object)
    end

    def secure_compare(a, b)
      return false if a.blank? || b.blank? || a.bytesize != b.bytesize
      l = a.unpack "C#{a.bytesize}"

      res = 0
      b.each_byte { |byte| res |= byte ^ l.shift }
      res == 0
    end
  end

end

class String
  def blank?
    self.nil? || self == ""
  end
end
