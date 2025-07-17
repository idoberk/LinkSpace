// import { useRef, useEffect } from 'react';

// const Canvas = (props) => {
// 	const ref = useRef();
// 	const draw = (context, count) => {
// 		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
// 		context.fillStyle = 'gray';
// 		const delta = count % 800;
// 		context.fillRect(10 + delta, 10, 300, 300);
// 	};

// 	useEffect(() => {
// 		const canvas = ref.current;
// 		const context = canvas.getContext('2d');
// 		let count = 0;
// 		let animationId;
// 		const render = () => {
// 			count++;
// 			draw(context, count);
// 			animationId = window.requestAnimationFrame(render);
// 		};
// 		render();
// 		return () => window.cancelAnimationFrame(animationId);
// 	}, []);

// 	return <canvas ref={ref} {...props} />;
// };
// export default Canvas;
'use client';

import { useRef, useEffect, useState } from 'react';

const Canvas = ({ width = 400, height = 300, className = '' }) => {
	const canvasRef = useRef(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [currentColor, setCurrentColor] = useState('#000000');
	const [brushSize, setBrushSize] = useState(2);
	const [tool, setTool] = useState('brush'); // 'brush', 'eraser'

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

		// Set canvas size
		canvas.width = width;
		canvas.height = height;

		// Set initial canvas background
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, width, height);

		// Set drawing properties
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
	}, [width, height]);

	const startDrawing = (e) => {
		setIsDrawing(true);
		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const ctx = canvas.getContext('2d');
		ctx.beginPath();
		ctx.moveTo(x, y);
	};

	const draw = (e) => {
		if (!isDrawing) return;

		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const ctx = canvas.getContext('2d');
		ctx.lineWidth = brushSize;

		if (tool === 'eraser') {
			ctx.globalCompositeOperation = 'destination-out';
		} else {
			ctx.globalCompositeOperation = 'source-over';
			ctx.strokeStyle = currentColor;
		}

		ctx.lineTo(x, y);
		ctx.stroke();
	};

	const stopDrawing = () => {
		setIsDrawing(false);
	};

	const clearCanvas = () => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, width, height);
	};

	const saveCanvas = () => {
		const canvas = canvasRef.current;
		const link = document.createElement('a');
		link.download = 'drawing.png';
		link.href = canvas.toDataURL();
		link.click();
	};

	return (
		<div
			className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
			<div className='flex items-center gap-4 mb-4 flex-wrap'>
				<div className='flex items-center gap-2'>
					<label className='text-sm font-medium'>Tool:</label>
					<select
						value={tool}
						onChange={(e) => setTool(e.target.value)}
						className='px-2 py-1 border rounded text-sm'>
						<option value='brush'>Brush</option>
						<option value='eraser'>Eraser</option>
					</select>
				</div>

				{tool === 'brush' && (
					<div className='flex items-center gap-2'>
						<label className='text-sm font-medium'>Color:</label>
						<input
							type='color'
							value={currentColor}
							onChange={(e) => setCurrentColor(e.target.value)}
							className='w-8 h-8 border rounded cursor-pointer'
						/>
					</div>
				)}

				<div className='flex items-center gap-2'>
					<label className='text-sm font-medium'>Size:</label>
					<input
						type='range'
						min='1'
						max='20'
						value={brushSize}
						onChange={(e) =>
							setBrushSize(Number.parseInt(e.target.value))
						}
						className='w-20'
					/>
					<span className='text-sm text-gray-600'>{brushSize}px</span>
				</div>

				<button
					onClick={clearCanvas}
					className='px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors'>
					Clear
				</button>

				<button
					onClick={saveCanvas}
					className='px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors'>
					Save
				</button>
			</div>

			<canvas
				ref={canvasRef}
				className='border border-gray-400 cursor-crosshair'
				onMouseDown={startDrawing}
				onMouseMove={draw}
				onMouseUp={stopDrawing}
				onMouseLeave={stopDrawing}
				style={{
					touchAction: 'none', // Prevent scrolling on touch devices
				}}
			/>
		</div>
	);
};

export default Canvas;
