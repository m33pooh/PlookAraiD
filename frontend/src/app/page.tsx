import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Leaf,
  TrendingUp,
  Users,
  MapPin,
  ArrowRight,
  BarChart3,
  Sprout,
  HandshakeIcon
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-900/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-900/30 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sprout size={16} />
              เพื่อนคู่คิดของเกษตรกรไทย
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              ตัดสินใจปลูกได้ดีขึ้น
              <br />
              <span className="gradient-text">ด้วยข้อมูลจริงจากตลาด</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              ระบบวิเคราะห์และแนะนำพืชที่เหมาะสมกับพื้นที่ของคุณ
              พร้อมเชื่อมต่อกับผู้รับซื้อโดยตรง ไม่ผ่านพ่อค้าคนกลาง
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  เริ่มค้นหาพืชที่เหมาะสม
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/market">
                <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                  <BarChart3 size={18} />
                  ดูราคาตลาด
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { icon: Users, value: '5,000+', label: 'เกษตรกร' },
              { icon: Leaf, value: '120+', label: 'ชนิดพืช' },
              { icon: HandshakeIcon, value: '1,200+', label: 'สัญญารับซื้อ' },
              { icon: MapPin, value: '77', label: 'จังหวัดทั่วไทย' },
            ].map((stat, i) => (
              <Card key={i} variant="elevated" className="text-center p-6">
                <stat.icon className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ทำไมต้อง <span className="gradient-text">ปลูกอะไรดี</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              เราช่วยให้คุณตัดสินใจได้ถูกต้อง ลดความเสี่ยง และเพิ่มรายได้
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: 'วิเคราะห์พื้นที่',
                description: 'ระบุพิกัด แหล่งน้ำ และดิน ระบบจะแนะนำพืชที่เหมาะสมที่สุด',
                color: 'emerald',
              },
              {
                icon: TrendingUp,
                title: 'ราคาตลาดแบบเรียลไทม์',
                description: 'ติดตามราคาสดจากตลาดกลาง ช่วยวางแผนการปลูกและขาย',
                color: 'blue',
              },
              {
                icon: HandshakeIcon,
                title: 'เชื่อมต่อผู้ซื้อโดยตรง',
                description: 'ทำสัญญารับซื้อล่วงหน้า มั่นใจว่ามีตลาดรองรับ',
                color: 'purple',
              },
            ].map((feature, i) => (
              <Card key={i} variant="bordered" className="p-6 hover:shadow-lg transition-shadow border-slate-700 bg-slate-800">
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-900/50 flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            พร้อมเริ่มต้นแล้วหรือยัง?
          </h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
            สมัครฟรี! ไม่มีค่าใช้จ่าย เริ่มวิเคราะห์พื้นที่ของคุณได้ทันที
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 gap-2"
            >
              สมัครสมาชิกฟรี
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
