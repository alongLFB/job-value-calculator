'use client'; // <--- 标记为客户端组件，因为我们需要 useState 和事件处理

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator"; // 引入分隔线

export default function Home() {
  // --- State for Input Fields ---
  const [name, setName] = useState('');
  // Change state types to string for inputs that allow decimals
  const [dailySalary, setDailySalary] = useState<string>('');
  const [workHours, setWorkHours] = useState<string>('');
  const [commuteHours, setCommuteHours] = useState<string>('');
  const [slackingHours, setSlackingHours] = useState<string>('');
  const [educationFactor, setEducationFactor] = useState('1.0'); // 使用字符串存储Select的值
  const [workEnvFactor, setWorkEnvFactor] = useState('1.0');
  const [oppositeSexFactor, setOppositeSexFactor] = useState('1.0');
  const [colleagueFactor, setColleagueFactor] = useState('1.0');
  const [qualificationFactor, setQualificationFactor] = useState('1.0');
  const [before830, setBefore830] = useState(false);
  const [overallEnvFactor, setOverallEnvFactor] = useState('1.0'); // 综合环境系数

  // --- State for Calculation Result ---
  const [costPerformance, setCostPerformance] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Calculation Logic ---
  const calculateValue = () => {
    setErrorMsg(null); // Clear previous errors
    setCostPerformance(null); // Clear previous result

    // --- Input Validation ---
    // Parse string states to numbers here
    const numDailySalary = parseFloat(dailySalary);
    const numWorkHours = parseFloat(workHours);
    const numCommuteHours = parseFloat(commuteHours);
    const numSlackingHours = parseFloat(slackingHours);

    // Check for NaN (which parseFloat returns for invalid or empty strings) and other conditions
    if (isNaN(numDailySalary) || numDailySalary <= 0 ||
        isNaN(numWorkHours) || numWorkHours <= 0 ||
        isNaN(numCommuteHours) || numCommuteHours < 0 || // Commute can be 0
        isNaN(numSlackingHours) || numSlackingHours < 0) { // Slacking can be 0
      setErrorMsg('请确保薪酬、工作、通勤和摸鱼时长是有效的正数（通勤和摸鱼可为0）。');
      return;
    }

    // --- Calculate Effective Work Hours ---
    const effectiveHours = numWorkHours + numCommuteHours - 0.5 * numSlackingHours;
    if (effectiveHours <= 0) {
       setCostPerformance(99999); // 给一个象征性的高分
       return;
    }

    const numOverallEnvFactor = parseFloat(overallEnvFactor);
    const numEducationFactor = parseFloat(educationFactor);
    const numWorkEnvFactor = parseFloat(workEnvFactor);
    const numOppositeSexFactor = parseFloat(oppositeSexFactor);
    const numColleagueFactor = parseFloat(colleagueFactor);
    const numQualificationFactor = parseFloat(qualificationFactor);
    const before830Penalty = before830 ? 0.95 : 1.0; // 示例：8:30前上班稍微降低系数

    // --- Final Calculation (Using your placeholder formula) ---
    // 性价比 = (平均日薪酬 / (工作时长 + 通勤时长 - 摸鱼时长)) * 综合环境系数
    const result = (numDailySalary / effectiveHours) * numOverallEnvFactor * numEducationFactor * numWorkEnvFactor * numOppositeSexFactor * numColleagueFactor * numQualificationFactor * before830Penalty;

    setCostPerformance(result);
  };

  // --- Helper function for number input change ---
  // Adjust setter type to expect string and set the value directly
  const handleNumberChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow empty string or valid decimal format (including intermediate states like "0." or ".")
        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
             setter(value); // Set the string value directly
        }
    };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800">
      <Card className="w-full max-w-3xl mb-6 shadow-xl transform hover:scale-105 transition-transform duration-300">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400">
            这 <span className="inline-block transform rotate-[-5deg] animate-bounce text-red-600 dark:text-red-500">B</span> 班上的值不值测算版
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400 pt-1">
            输入你的搬砖参数，看看性价比几何... 仅供娱乐！
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="w-full max-w-3xl shadow-lg">
        <CardContent className="pt-6">
          <form onSubmit={(e) => { e.preventDefault(); calculateValue(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* --- Input Fields --- */}
              <div className="space-y-1.5">
                <Label htmlFor="name">你的大名/代号</Label>
                <Input id="name" placeholder="打工人" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dailySalary" className="flex items-center">平均日薪酬 (元) <span className="text-red-500 ml-1">*</span></Label>
                {/* No changes needed here for the Input component itself */}
                <Input id="dailySalary" type="text" inputMode="decimal" placeholder="例如 300" value={dailySalary} onChange={handleNumberChange(setDailySalary)} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="workHours" className="flex items-center">工作时长 (小时/天) <span className="text-red-500 ml-1">*</span></Label>
                 {/* No changes needed here for the Input component itself */}
                <Input id="workHours" type="text" inputMode="decimal" placeholder="例如 8" value={workHours} onChange={handleNumberChange(setWorkHours)} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="commuteHours" className="flex items-center">通勤时长 (小时/天) <span className="text-red-500 ml-1">*</span></Label>
                 {/* No changes needed here for the Input component itself */}
                <Input id="commuteHours" type="text" inputMode="decimal" placeholder="例如 1.5" value={commuteHours} onChange={handleNumberChange(setCommuteHours)} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slackingHours" className="flex items-center">摸鱼时长 (小时/天) <span className="text-red-500 ml-1">*</span></Label>
                 {/* No changes needed here for the Input component itself */}
                <Input id="slackingHours" type="text" inputMode="decimal" placeholder="例如 2" value={slackingHours} onChange={handleNumberChange(setSlackingHours)} />
              </div>

              {/* --- 其他系数 (暂时隐藏，按需启用或集成到综合系数中) --- */}
              
              <div className="space-y-1">
                <Label htmlFor="educationFactor">学历系数</Label>
                 <Select value={educationFactor} onValueChange={setEducationFactor}>
                   <SelectTrigger id="educationFactor"><SelectValue placeholder="选择系数" /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="0.9">高中及以下</SelectItem>
                     <SelectItem value="1.0">大专/本科</SelectItem>
                     <SelectItem value="1.1">硕士</SelectItem>
                     <SelectItem value="1.2">博士</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
               <div className="space-y-1">
                 <Label htmlFor="workEnvFactor">工作环境系数</Label>
                 <Select value={workEnvFactor} onValueChange={setWorkEnvFactor}>
                   <SelectTrigger id="workEnvFactor"><SelectValue placeholder="选择系数" /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="0.8">压抑</SelectItem>
                     <SelectItem value="1.0">正常</SelectItem>
                     <SelectItem value="1.2">舒适</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
                <div className="space-y-1">
                 <Label htmlFor="oppositeSexFactor">异性环境系数</Label>
                 <Select value={oppositeSexFactor} onValueChange={setOppositeSexFactor}>
                   <SelectTrigger id="oppositeSexFactor"><SelectValue placeholder="选择系数" /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="0.9">几乎没有</SelectItem>
                     <SelectItem value="1.0">有一些</SelectItem>
                     <SelectItem value="1.1">挺多的</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-1">
                 <Label htmlFor="colleagueFactor">同事环境系数</Label>
                 <Select value={colleagueFactor} onValueChange={setColleagueFactor}>
                   <SelectTrigger id="colleagueFactor"><SelectValue placeholder="选择系数" /></SelectTrigger>
                   <SelectContent>
                      <SelectItem value="0.7">勾心斗角</SelectItem>
                     <SelectItem value="1.0">各自为战</SelectItem>
                     <SelectItem value="1.3">和谐互助</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-1">
                 <Label htmlFor="qualificationFactor">职业资格系数</Label>
                  <Select value={qualificationFactor} onValueChange={setQualificationFactor}>
                   <SelectTrigger id="qualificationFactor"><SelectValue placeholder="选择系数" /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="1.0">无要求/通用</SelectItem>
                     <SelectItem value="1.1">有加分项</SelectItem>
                     <SelectItem value="1.2">硬性要求/稀缺</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

              <div className="space-y-1.5">
                 <Label htmlFor="overallEnvFactor">综合环境系数 (主观)</Label>
                 <Select value={overallEnvFactor} onValueChange={setOverallEnvFactor}>
                   <SelectTrigger id="overallEnvFactor">
                     <SelectValue placeholder="选择系数" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="0.7">贼差 (0.7)</SelectItem>
                     <SelectItem value="0.8">不太行 (0.8)</SelectItem>
                     <SelectItem value="0.9">有点亏 (0.9)</SelectItem>
                     <SelectItem value="1.0">一般般 (1.0)</SelectItem>
                     <SelectItem value="1.1">还凑合 (1.1)</SelectItem>
                     <SelectItem value="1.2">还不错 (1.2)</SelectItem>
                     <SelectItem value="1.3">挺好的 (1.3)</SelectItem>
                     <SelectItem value="1.5">相当好 (1.5)</SelectItem>
                     <SelectItem value="2.0">神仙级 (2.0)</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

              {/* --- Checkbox --- */}
              <div className="flex items-center space-x-2 pt-2 md:col-span-2 justify-center">
                 <Checkbox id="before830" checked={before830} onCheckedChange={(checked) => setBefore830(Boolean(checked))} />
                 <Label htmlFor="before830" className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                   是否需要在 <span className="font-bold text-orange-600 dark:text-orange-400">8:30</span> 前上班？ (勾选将扣除一点点性价比)
                 </Label>
              </div>

            </div>

            <Separator className="my-6" />

            <div className="flex justify-center">
              <Button type="submit" size="lg" className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-lg font-semibold py-3 px-8 shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105">
                开始测算值不值！
              </Button>
            </div>
          </form>
        </CardContent>

        {/* ... rest of the component ... */}
        {(costPerformance !== null || errorMsg) && (
          <CardFooter className="flex flex-col items-center pt-6 border-t mt-4">
            {errorMsg && (
              <p className="text-red-600 dark:text-red-400 text-center font-semibold text-lg animate-pulse">{errorMsg}</p>
            )}
            {costPerformance !== null && !errorMsg && (
              <div className="text-center space-y-2 w-full">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  喂 <span className="font-semibold text-purple-700 dark:text-purple-400">{name || '靓仔/靓女'}</span>, 你的上班性价比指数是：
                </p>
                <div className="relative inline-block">
                    <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-pulse">
                    {costPerformance === 99999 ? "摸鱼™爽翻天" : costPerformance.toFixed(2)}
                    </p>
                    {costPerformance !== 99999 &&
                        <span className="absolute -top-2 -right-4 text-xs bg-yellow-400 text-yellow-800 px-1.5 py-0.5 rounded-full shadow transform -rotate-12">
                            {costPerformance < 30 ? "危" : costPerformance < 60 ? "忍" : costPerformance < 100 ? "可" : "赚"}
                        </span>
                    }
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                  (指数越高，代表单位有效时间回报和环境满意度越高。仅供娱乐，切勿当真哦！)
                </p>
                 {costPerformance !== null && costPerformance !== 99999 && (
                    <div className="pt-2 text-sm">
                         {costPerformance < 30 && <p className="text-red-600 dark:text-red-400 font-semibold">这班上的...要不考虑跑路？手慢无，赶紧撤！🏃💨</p>}
                         {costPerformance >= 30 && costPerformance < 60 && <p className="text-orange-600 dark:text-orange-400 font-semibold">食之无味，弃之可惜。熬一熬，零食会有的。😐</p>}
                         {costPerformance >= 60 && costPerformance < 100 && <p className="text-green-600 dark:text-green-400 font-semibold">还不错哦！这班勉强配得上优秀的你！🎉</p>}
                         {costPerformance >= 100 && <p className="text-emerald-500 dark:text-emerald-400 font-semibold">卧槽！神仙班！这是碳基生物该上的班吗？速速炫耀！🤩</p>}
                    </div>
                 )}
                 {costPerformance === 99999 && <p className="mt-2 text-indigo-500 dark:text-indigo-400 font-semibold">摸鱼时长 大于 工作+通勤，你是懂上班的！摸鱼之神！🏆</p>}
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </main>
  );
}