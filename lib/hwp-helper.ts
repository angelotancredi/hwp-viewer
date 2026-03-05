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
    console.log('renderHwp: Starting with file size:', fileData.byteLength);
    try {
        // 1. hwp.js 인스턴스 동적 로드 (SSR 에러 방지)
        const { Viewer, parse } = await import('hwp.js');
        console.log('hwp.js loaded:', { Viewer, parse });

        const uint8Data = new Uint8Array(fileData);
        console.log('uint8Array created, length:', uint8Data.length);

        // 2. Viewer 인스턴스 생성
        // hahnlee/hwp.js API: new Viewer(container, data)
        const viewer = new Viewer(containerElement, uint8Data);
        console.log('Viewer instance created:', viewer);

        // 3. 만약 parse 기능이 필요하다면 (디버그용)
        try {
            const hwpDoc = parse(uint8Data);
            console.log('Parsed HWP Document structure:', hwpDoc);
        } catch (pe) {
            console.warn('Parsing test failed (optional):', pe);
        }

        console.log('HWP rendering successfully initiated');
    } catch (error) {
        console.error('HWP rendering failed:', error);
        // 에러를 상위(Component)로 던져서 UI에 표시하게 함
        throw error;
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
