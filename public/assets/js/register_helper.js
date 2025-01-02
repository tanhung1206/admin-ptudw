Handlebars.registerHelper({
    eq: (a, b) => a === b, // So sánh bằng
    neq: (a, b) => a !== b, // So sánh không bằng
    for: function (from, to, block) { // Vòng lặp từ from đến to
        let accum = '';
        for (let i = from; i <= to; i++) {
            accum += block.fn(i); // Render nội dung bên trong {{#for}}...{{/for}}
        }
        return accum;
    },
    gte: (a, b) => a >= b, // So sánh lớn hơn hoặc bằng
    lte: (a, b) => a <= b, // So sánh nhỏ hơn hoặc bằng
    gt: (a, b) => a > b, // So sánh lớn hơn
    subtract: (a, b) => a - b, // Phép trừ
    add: (a, b) => a + b, // Phép cộng
    inRange: (value, a, b) => value >= a && value <= b // Kiểm tra giá trị nằm trong khoảng
});