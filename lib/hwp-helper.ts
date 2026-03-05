/**
 * HWP Documentation & hwp.js Integration Guide
 */

/**
 * .hwp 파일을 클라이언트 사이드에서 렌더링하는 기본 로직 예시
 * 
 * @param fileData ArrayBuffer 형태의 HWP 파일 데이터
 * @param containerElement 렌더링될 HTML Element
 */
export async function renderHwp(fileData: ArrayBuffer, containerElement: HTMLElement) {
    try {
        // 1. hwp.js 인스턴스 동적 로드 (SSR 에러 방지)
        const { Viewer } = await import('hwp.js');

        // hahnlee/hwp.js API: new Viewer(container, data) data must be Uint8Array
        new Viewer(containerElement, new Uint8Array(fileData));

        console.log('HWP rendering initiated');
    } catch (error) {
        console.error('HWP rendering failed:', error);
        containerElement.innerHTML = `<div class="p-8 text-red-500">문서를 읽는 중 오류가 발생했습니다: ${error}</div>`;
    }
}

/**
 * Usage in React Component:
 * 
 * useEffect(() => {
 *   if (selectedFile?.data && viewerRef.current) {
 *     renderHwp(selectedFile.data, viewerRef.current);
 *   }
 * }, [selectedFile]);
 */
