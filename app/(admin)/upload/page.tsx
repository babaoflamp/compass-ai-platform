'use client'

import { useState } from 'react'
import Papa from 'papaparse'

interface UploadResult {
  success: boolean
  message: string
  stats?: {
    total: number
    success: number
    failed: number
  }
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      // CSV 파일 파싱
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          // API로 데이터 전송
          const response = await fetch('/api/upload/students', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ students: results.data }),
          })

          const data = await response.json()
          setResult(data)
          setUploading(false)
        },
        error: (error) => {
          setResult({
            success: false,
            message: `CSV 파싱 오류: ${error.message}`,
          })
          setUploading(false)
        },
      })
    } catch (error) {
      setResult({
        success: false,
        message: '업로드 중 오류가 발생했습니다.',
      })
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 데이터 업로드</h1>
          <p className="text-gray-600 mt-2">학생 역량 데이터를 CSV 파일로 업로드하세요</p>
        </div>

        {/* CSV 형식 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">📋 CSV 파일 형식</h2>
          <div className="bg-white rounded p-4 font-mono text-sm overflow-x-auto">
            <div className="text-gray-700">
              studentId,name,email,department,grade,creativity,collaboration,problemSolving
            </div>
            <div className="text-gray-500">
              20240001,홍길동,hong@example.com,컴퓨터공학과,2,75,82,68
            </div>
            <div className="text-gray-500">
              20240002,김철수,kim@example.com,경영학과,3,88,76,91
            </div>
          </div>
          <p className="text-sm text-blue-700 mt-3">
            ⚠️ 첫 번째 행은 헤더여야 하며, 역량 점수는 0-100 사이의 숫자입니다.
          </p>
        </div>

        {/* 파일 업로드 영역 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV 파일 선택
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
            </div>

            {file && (
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-600">
                  선택된 파일: <span className="font-semibold">{file.name}</span>
                  <span className="text-gray-400 ml-2">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full py-3 px-4 rounded font-semibold transition-colors ${
                !file || uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading ? '업로드 중...' : '업로드 시작'}
            </button>
          </div>
        </div>

        {/* 업로드 결과 */}
        {result && (
          <div
            className={`rounded-lg p-6 ${
              result.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-2 ${
                result.success ? 'text-green-900' : 'text-red-900'
              }`}
            >
              {result.success ? '✅ 업로드 완료' : '❌ 업로드 실패'}
            </h3>
            <p className={result.success ? 'text-green-700' : 'text-red-700'}>
              {result.message}
            </p>

            {result.stats && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-white rounded p-3">
                  <div className="text-sm text-gray-600">전체</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.stats.total}
                  </div>
                </div>
                <div className="bg-white rounded p-3">
                  <div className="text-sm text-green-600">성공</div>
                  <div className="text-2xl font-bold text-green-600">
                    {result.stats.success}
                  </div>
                </div>
                <div className="bg-white rounded p-3">
                  <div className="text-sm text-red-600">실패</div>
                  <div className="text-2xl font-bold text-red-600">
                    {result.stats.failed}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 샘플 CSV 다운로드 */}
        <div className="mt-6 text-center">
          <a
            href="/sample-students.csv"
            download
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            📥 샘플 CSV 파일 다운로드
          </a>
        </div>
      </div>
    </div>
  )
}
