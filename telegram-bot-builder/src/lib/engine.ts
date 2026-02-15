export interface Variable {
    name: string;
    value: any;
    type: 'string' | 'number' | 'boolean';
}

export function interpolate(text: string, variables: Record<string, any>): string {
    return text.replace(/\{(\w+)\}/g, (match, varName) => {
        return variables[varName] !== undefined ? String(variables[varName]) : match;
    });
}

export function evaluateCondition(condition: any, variables: Record<string, any>): boolean {
    if (!condition || !condition.variable) return true;

    const varValue = variables[condition.variable];
    const targetValue = condition.value;
    const operator = condition.operator || 'equals';

    switch (operator) {
        case 'equals':
            return String(varValue) === String(targetValue);
        case 'not_equals':
            return String(varValue) !== String(targetValue);
        case 'greater':
            return Number(varValue) > Number(targetValue);
        case 'less':
            return Number(varValue) < Number(targetValue);
        case 'contains':
            return String(varValue).includes(String(targetValue));
        default:
            return true;
    }
}
