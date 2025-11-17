import OpenAI from 'openai';

export interface DocumentExtractionResult {
  documentType: string;
  extractedData: Record<string, unknown>;
  confidence: number; // 0-1
  warnings: string[];
  suggestions: string[];
}

/**
 * AI Document Extractor
 * Extracts structured data from Indonesian identity and employment documents
 */
export class AIDocumentExtractor {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Extract data from KTP (Indonesian ID Card)
   */
  async extractKTP(imageUrl: string): Promise<DocumentExtractionResult> {
    try {
      const systemPrompt = `You are an AI document extraction expert for Indonesian KTP (Kartu Tanda Penduduk).
Extract all visible information from the KTP image accurately.

Expected fields:
- NIK (16-digit number)
- Full Name (Nama)
- Place of Birth (Tempat Lahir)
- Date of Birth (Tanggal Lahir) - format: DD-MM-YYYY
- Gender (Jenis Kelamin) - LAKI-LAKI or PEREMPUAN
- Blood Type (Golongan Darah) - if visible
- Address (Alamat)
- RT/RW
- Kelurahan/Desa
- Kecamatan
- Religion (Agama)
- Marital Status (Status Perkawinan)
- Occupation (Pekerjaan)
- Citizenship (Kewarganegaraan)
- Valid Until (Berlaku Hingga)

Return JSON format:
{
  "nik": "string",
  "fullName": "string",
  "placeOfBirth": "string",
  "dateOfBirth": "DD-MM-YYYY",
  "gender": "LAKI-LAKI|PEREMPUAN",
  "bloodType": "string or null",
  "address": "string",
  "rtRw": "string",
  "kelurahan": "string",
  "kecamatan": "string",
  "city": "string",
  "province": "string",
  "religion": "string",
  "maritalStatus": "string",
  "occupation": "string",
  "citizenship": "string",
  "validUntil": "string",
  "confidence": number (0-1),
  "warnings": ["warning1"],
  "suggestions": ["suggestion1"]
}`;

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all data from this KTP image accurately.',
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0]?.message?.content ?? '{}');

      return {
        documentType: 'ktp',
        extractedData: {
          nik: result.nik ?? null,
          fullName: result.fullName ?? null,
          placeOfBirth: result.placeOfBirth ?? null,
          dateOfBirth: result.dateOfBirth ?? null,
          gender: result.gender ?? null,
          bloodType: result.bloodType ?? null,
          address: result.address ?? null,
          rtRw: result.rtRw ?? null,
          kelurahan: result.kelurahan ?? null,
          kecamatan: result.kecamatan ?? null,
          city: result.city ?? null,
          province: result.province ?? null,
          religion: result.religion ?? null,
          maritalStatus: result.maritalStatus ?? null,
          occupation: result.occupation ?? null,
          citizenship: result.citizenship ?? null,
          validUntil: result.validUntil ?? null,
        },
        confidence: result.confidence ?? 0.8,
        warnings: result.warnings ?? [],
        suggestions: result.suggestions ?? [],
      };
    } catch (error) {
      console.error('KTP extraction failed:', error);
      throw new Error('Failed to extract KTP data');
    }
  }

  /**
   * Extract data from NPWP (Tax ID)
   */
  async extractNPWP(imageUrl: string): Promise<DocumentExtractionResult> {
    try {
      const systemPrompt = `You are an AI document extraction expert for Indonesian NPWP (Nomor Pokok Wajib Pajak).
Extract all visible information from the NPWP image accurately.

Expected fields:
- NPWP Number (15 digits with format: XX.XXX.XXX.X-XXX.XXX)
- Full Name (Nama)
- NIK (if visible)
- Address (Alamat)
- Kelurahan/Desa
- Kecamatan
- City/Regency (Kota/Kabupaten)
- Province (Provinsi)
- Registration Date (Terdaftar Sejak)

Return JSON format:
{
  "npwpNumber": "string",
  "fullName": "string",
  "nik": "string or null",
  "address": "string",
  "kelurahan": "string",
  "kecamatan": "string",
  "city": "string",
  "province": "string",
  "registrationDate": "DD-MM-YYYY or null",
  "confidence": number (0-1),
  "warnings": ["warning1"],
  "suggestions": ["suggestion1"]
}`;

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all data from this NPWP image accurately.',
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0]?.message?.content ?? '{}');

      return {
        documentType: 'npwp',
        extractedData: {
          npwpNumber: result.npwpNumber ?? null,
          fullName: result.fullName ?? null,
          nik: result.nik ?? null,
          address: result.address ?? null,
          kelurahan: result.kelurahan ?? null,
          kecamatan: result.kecamatan ?? null,
          city: result.city ?? null,
          province: result.province ?? null,
          registrationDate: result.registrationDate ?? null,
        },
        confidence: result.confidence ?? 0.8,
        warnings: result.warnings ?? [],
        suggestions: result.suggestions ?? [],
      };
    } catch (error) {
      console.error('NPWP extraction failed:', error);
      throw new Error('Failed to extract NPWP data');
    }
  }

  /**
   * Extract data from BPJS Kesehatan Card
   */
  async extractBPJSKesehatan(imageUrl: string): Promise<DocumentExtractionResult> {
    try {
      const systemPrompt = `You are an AI document extraction expert for Indonesian BPJS Kesehatan card.
Extract all visible information from the BPJS Kesehatan card image accurately.

Expected fields:
- Card Number (Nomor Kartu) - 13 digits
- Full Name (Nama Peserta)
- NIK (if visible)
- Date of Birth (Tanggal Lahir)
- Class (Kelas) - 1, 2, or 3
- Facility (Faskes/PPK 1)
- Valid From (Berlaku Sejak)

Return JSON format:
{
  "cardNumber": "string",
  "fullName": "string",
  "nik": "string or null",
  "dateOfBirth": "DD-MM-YYYY or null",
  "class": "1|2|3",
  "facility": "string",
  "validFrom": "DD-MM-YYYY or null",
  "confidence": number (0-1),
  "warnings": ["warning1"],
  "suggestions": ["suggestion1"]
}`;

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all data from this BPJS Kesehatan card image accurately.',
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0]?.message?.content ?? '{}');

      return {
        documentType: 'bpjs_kesehatan',
        extractedData: {
          cardNumber: result.cardNumber ?? null,
          fullName: result.fullName ?? null,
          nik: result.nik ?? null,
          dateOfBirth: result.dateOfBirth ?? null,
          class: result.class ?? null,
          facility: result.facility ?? null,
          validFrom: result.validFrom ?? null,
        },
        confidence: result.confidence ?? 0.8,
        warnings: result.warnings ?? [],
        suggestions: result.suggestions ?? [],
      };
    } catch (error) {
      console.error('BPJS Kesehatan extraction failed:', error);
      throw new Error('Failed to extract BPJS Kesehatan data');
    }
  }

  /**
   * Extract data from Contract/Offer Letter
   */
  async extractContract(
    fileUrl: string,
    mimeType: string
  ): Promise<DocumentExtractionResult> {
    try {
      const systemPrompt = `You are an AI document extraction expert for employment contracts and offer letters.
Extract key information from the contract document.

Expected fields:
- Employee Name
- Position/Title
- Employment Type (PKWT/PKWTT/Permanent/Contract/Probation)
- Start Date
- End Date (for contracts)
- Base Salary
- Allowances
- Benefits
- Working Hours
- Work Location
- Probation Period
- Notice Period

Return JSON format:
{
  "employeeName": "string",
  "position": "string",
  "employmentType": "string",
  "startDate": "DD-MM-YYYY or null",
  "endDate": "DD-MM-YYYY or null",
  "baseSalary": number or null,
  "allowances": ["allowance1"],
  "benefits": ["benefit1"],
  "workingHours": "string or null",
  "workLocation": "string or null",
  "probationPeriod": "string or null",
  "noticePeriod": "string or null",
  "confidence": number (0-1),
  "warnings": ["warning1"],
  "suggestions": ["suggestion1"]
}`;

      let content;
      if (mimeType.includes('image')) {
        content = [
          {
            type: 'text',
            text: 'Extract key information from this employment contract/offer letter.',
          },
          {
            type: 'image_url',
            image_url: { url: fileUrl },
          },
        ];
      } else {
        content = `Extract key information from this employment contract/offer letter.
File URL: ${fileUrl}

Note: This is a ${mimeType} file. Extract what you can from the context.`;
      }

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: content as any,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0]?.message?.content ?? '{}');

      return {
        documentType: 'contract',
        extractedData: {
          employeeName: result.employeeName ?? null,
          position: result.position ?? null,
          employmentType: result.employmentType ?? null,
          startDate: result.startDate ?? null,
          endDate: result.endDate ?? null,
          baseSalary: result.baseSalary ?? null,
          allowances: result.allowances ?? [],
          benefits: result.benefits ?? [],
          workingHours: result.workingHours ?? null,
          workLocation: result.workLocation ?? null,
          probationPeriod: result.probationPeriod ?? null,
          noticePeriod: result.noticePeriod ?? null,
        },
        confidence: result.confidence ?? 0.7,
        warnings: result.warnings ?? [],
        suggestions: result.suggestions ?? [],
      };
    } catch (error) {
      console.error('Contract extraction failed:', error);
      throw new Error('Failed to extract contract data');
    }
  }

  /**
   * Auto-detect document type and extract
   */
  async autoExtract(
    fileUrl: string,
    mimeType: string,
    documentType?: string
  ): Promise<DocumentExtractionResult> {
    // If document type is specified, use specific extractor
    if (documentType) {
      switch (documentType) {
        case 'ktp':
          return this.extractKTP(fileUrl);
        case 'npwp':
          return this.extractNPWP(fileUrl);
        case 'bpjs_kesehatan':
          return this.extractBPJSKesehatan(fileUrl);
        case 'contract':
        case 'offer_letter':
          return this.extractContract(fileUrl, mimeType);
        default:
          throw new Error(`Extraction not supported for document type: ${documentType}`);
      }
    }

    // Auto-detect document type (for images only)
    if (!mimeType.includes('image')) {
      throw new Error('Auto-detection only works for image files');
    }

    try {
      const detectPrompt = `Analyze this Indonesian document image and identify its type.

Possible types:
- KTP (Kartu Tanda Penduduk - ID Card)
- NPWP (Tax ID)
- BPJS Kesehatan (Health Insurance Card)
- BPJS Ketenagakerjaan (Employment Insurance Card)
- Kartu Keluarga (Family Card)
- Passport
- Contract/Offer Letter
- Other

Return JSON:
{
  "documentType": "ktp|npwp|bpjs_kesehatan|bpjs_ketenagakerjaan|kk|passport|contract|other",
  "confidence": number (0-1)
}`;

      const detectResponse = await this.openai.chat.completions.create({
        model: process.env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: detectPrompt },
              { type: 'image_url', image_url: { url: fileUrl } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const detection = JSON.parse(detectResponse.choices[0]?.message?.content ?? '{}');
      const detectedType = detection.documentType;

      // Extract based on detected type
      return this.autoExtract(fileUrl, mimeType, detectedType);
    } catch (error) {
      console.error('Auto-extraction failed:', error);
      throw new Error('Failed to auto-detect and extract document');
    }
  }

  /**
   * Validate extracted data against expected format
   */
  validateExtraction(
    documentType: string,
    extractedData: Record<string, unknown>
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    switch (documentType) {
      case 'ktp':
        if (!extractedData.nik || !/^\d{16}$/.test(String(extractedData.nik))) {
          errors.push('Invalid NIK format (must be 16 digits)');
        }
        if (!extractedData.fullName) {
          errors.push('Full name is required');
        }
        break;

      case 'npwp':
        if (
          !extractedData.npwpNumber ||
          !/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/.test(String(extractedData.npwpNumber))
        ) {
          errors.push('Invalid NPWP format (must be XX.XXX.XXX.X-XXX.XXX)');
        }
        break;

      case 'bpjs_kesehatan':
        if (
          !extractedData.cardNumber ||
          !/^\d{13}$/.test(String(extractedData.cardNumber))
        ) {
          errors.push('Invalid BPJS card number (must be 13 digits)');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
