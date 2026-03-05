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
    console.log('[hwp-helper] Starting renderHwp. Buffer size:', fileData.byteLength);

    try {
        // 1. hwp.js 동적 로드
        const hwpjs = await import('hwp.js');
        const { Viewer, parse } = hwpjs;
        console.log('[hwp-helper] hwp.js modules loaded:', Object.keys(hwpjs));

        const uint8Data = new Uint8Array(fileData);

        // 2. 데이터 파싱 테스트 (데이터가 정상인지 확인)
        try {
            const doc = parse(uint8Data);
            console.log('[hwp-helper] Parse successful. Document object:', doc);

            // 만약 텍스트 추출이 필요하다면 여기서 로직을 추가할 수 있으나, 
            // hahnlee/hwp.js는 주로 Viewer를 통한 렌더링을 지향함.
        } catch (parseError) {
            console.error('[hwp-helper] parse() failed:', parseError);
            throw new Error(`HWP 파싱 실패: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }

        // 3. Viewer 렌더링
        console.log('[hwp-helper] Attempting to create Viewer with container:', containerElement);

        // containerElement의 높이가 0이면 안 보이므로 강제 설정 (One UI 스택에 맞춰 조절)
        if (containerElement.clientHeight === 0) {
            console.warn('[hwp-helper] Container height is 0. Setting min-height.');
            containerElement.style.minHeight = '600px';
        }

        const viewer = new Viewer(containerElement, uint8Data);
        console.log('[hwp-helper] Viewer instance created:', viewer);

        // 4. 추가 확인: viewer 내부의 DOM이 생성되었는지
        setTimeout(() => {
            console.log('[hwp-helper] Container child count after 300ms:', containerElement.childElementCount);
            if (containerElement.childElementCount === 0) {
                console.error('[hwp-helper] Viewer did not add any elements to the container.');
            }
        }, 300);

    } catch (error) {
        console.error('[hwp-helper] Critical error in renderHwp:', error);
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
